import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises';
import { resolve, extname, sep, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LocalStore } from './local-store.mjs';
import { randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root=fileURLToPath(new URL('.',import.meta.url));
const dist=resolve(root,'dist');
const dataDir=resolve(root,'data');
const contentFile=resolve(root,'content/stories.json');
await mkdir(dataDir,{recursive:true});
const store=new LocalStore(resolve(dataDir,'state.json'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const limits=new Map();let writeQueue=Promise.resolve();
const hash=value=>createHash('sha256').update(value).digest('hex');
function json(res,status,value,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(value))}
function fail(res,status,message){json(res,status,{error:message})}
function sameOrigin(req){const origin=req.headers.origin;if(!origin)return false;try{return new URL(origin).host===req.headers.host&&['http:','https:'].includes(new URL(origin).protocol)}catch{return false}}
function rate(key,max,interval){const now=Date.now(),entry=limits.get(key);if(!entry||now>entry.until){limits.set(key,{count:1,until:now+interval});return true}entry.count++;return entry.count<=max}
function clientKey(req){return req.socket.remoteAddress||'local'}
async function body(req){let chunks='',bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>30000)throw Error('too large');chunks+=chunk}return JSON.parse(chunks||'{}')}
function token(req){return /(?:^|;\s*)nocturna_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1]}
function session(req){const value=token(req);return value?store.session(hash(value)):null}
function authenticated(req,requestBody){const value=session(req);return value&&value.expires>Date.now()&&req.headers['x-csrf-token']===value.csrf}
function published(slug){return stories().some(s=>s.slug===slug&&s.status==='published')}
function stories(){return JSON.parse(requireContent())}
let cachedContent='[]';
async function loadContent(){cachedContent=await readFile(contentFile,'utf8')}
function requireContent(){return cachedContent}
await loadContent();
function validStory(s){if(!s||typeof s!=='object'||!/^([a-z0-9]+)(-[a-z0-9]+)*$/.test(s.slug||''))return false;if(!['draft','review','published'].includes(s.status)||!['documented','unverified','fiction'].includes(s.classification))return false;const p=s.place||{};if(!['city','region','country'].every(k=>typeof p[k]==='string'&&p[k].trim())||!Number.isFinite(p.latitude)||!Number.isFinite(p.longitude)||Math.abs(p.latitude)>90||Math.abs(p.longitude)>180)return false;if(!/^\d{4}-\d{2}-\d{2}$/.test(s.publishedAt||'')||!/^\d{4}-\d{2}-\d{2}$/.test(s.updatedAt||''))return false;if(!Array.isArray(s.sources)||s.sources.length>10||!s.sources.every(src=>typeof src.title==='string'&&src.title.trim().length>0&&src.title.length<200&&typeof src.url==='string'&&/^https:\/\//.test(src.url)))return false;if(s.explore!==undefined&&(!Array.isArray(s.explore)||s.explore.length>10||!s.explore.every(item=>['document','image','audio','video','reading'].includes(item.kind)&&typeof item.url==='string'&&/^https:\/\//.test(item.url)&&['pt','en','es'].every(lang=>typeof item.labels?.[lang]==='string'&&item.labels[lang].trim()&&item.labels[lang].length<200))))return false;if(s.status==='published'){if(!['pt','en','es'].every(lang=>['title','summary','body'].every(k=>typeof s.translations?.[lang]?.[k]==='string'&&s.translations[lang][k].trim()&&s.translations[lang][k].length<15000)))return false;if(s.classification==='documented'&&!s.sources.length)return false}return true}
async function saveStory(story){const current=stories();const index=current.findIndex(s=>s.slug===story.slug);if(index>=0)current[index]=story;else current.push(story);const next=JSON.stringify(current,null,2)+'\n';const temp=contentFile+'.tmp';await writeFile(temp,next);const previous=cachedContent;await rename(temp,contentFile);const python=process.platform==='win32'?'py':'python3',args=process.platform==='win32'?['-3','build_pages.py']:['build_pages.py'];const build=spawnSync(python,args,{cwd:root,encoding:'utf8',timeout:15000});if(build.status!==0){await writeFile(contentFile,previous);throw Error('Falha ao gerar páginas: '+(build.stderr||build.error?.message||'erro desconhecido').slice(0,300))}cachedContent=next}
async function api(req,res,url){
  if(req.method==='GET'&&url.pathname==='/api/stories'){
    return json(res,200,{stories:stories().filter(s=>s.status==='published').map(s=>({slug:s.slug,classification:s.classification,place:s.place,translations:s.translations}))});
  }
  if(req.method==='GET'&&url.pathname==='/api/comments/regions'){
    const catalogue=new Map(stories().filter(s=>s.status==='published').map(s=>[s.slug,s]));
    const comments=store.approvedRecent()
      .flatMap(comment=>{const story=catalogue.get(comment.slug);return story?[{...comment,latitude:story.place.latitude,longitude:story.place.longitude,city:story.place.city,storyTitle:story.translations}]:[]});
    return json(res,200,{comments});
  }
  if(req.method==='GET'&&url.pathname==='/api/comments'){
    const slug=url.searchParams.get('story');if(!slug||!published(slug))return fail(res,404,'História indisponível');
    return json(res,200,{comments:store.approvedForStory(slug)});
  }
  if(req.method==='POST'&&url.pathname==='/api/comments'){
    if(!sameOrigin(req))return fail(res,403,'Origem inválida');if(!rate('comment:'+clientKey(req),5,600000))return fail(res,429,'Aguarde antes de comentar');
    const input=await body(req);if(input.website)return json(res,202,{status:'pending'});
    if(!published(input.story)||!['pt','en','es'].includes(input.lang)||typeof input.author!=='string'||typeof input.body!=='string'||input.author.trim().length<2||input.author.trim().length>50||input.body.trim().length<3||input.body.trim().length>2000)return fail(res,400,'Revise o comentário');
    store.addComment({slug:input.story,author:input.author.trim(),body:input.body.trim(),lang:input.lang,status:'pending',created_at:new Date().toISOString()});return json(res,202,{status:'pending'});
  }
  if(req.method==='POST'&&url.pathname==='/api/admin/login'){
    if(!sameOrigin(req))return fail(res,403,'Origem inválida');if(!rate('login:'+clientKey(req),8,900000))return fail(res,429,'Tente novamente mais tarde');
    const input=await body(req);const admin=JSON.parse(await readFile(resolve(dataDir,'admin.json'),'utf8').catch(()=>'{}'));const saved=Buffer.from(admin.hash||'','hex');const calculated=scryptSync(String(input.password||''),Buffer.from(admin.salt||'','hex'),64);
    if(saved.length!==64||!timingSafeEqual(saved,calculated))return fail(res,401,'Senha inválida');
    const value=randomBytes(32).toString('hex'),csrf=randomBytes(24).toString('hex');store.addSession(hash(value),csrf,Date.now()+12*3600000);
    const secure=req.socket.encrypted?'; Secure':'';return json(res,200,{csrf},{'Set-Cookie':`nocturna_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secure}`});
  }
  const user=session(req);
  if(!user||user.expires<=Date.now())return fail(res,401,'Acesso restrito');
  if(req.method==='GET'&&url.pathname==='/api/admin/me')return json(res,200,{csrf:user.csrf});
  if(req.method==='GET'&&url.pathname==='/api/admin/stories')return json(res,200,{stories:stories()});
  if(req.method==='GET'&&url.pathname==='/api/admin/comments')return json(res,200,{comments:store.allComments()});
  if(!sameOrigin(req)||req.headers['x-csrf-token']!==user.csrf)return fail(res,403,'Solicitação inválida');
  if(req.method==='POST'&&url.pathname==='/api/admin/logout'){store.removeSession(hash(token(req)));return json(res,200,{ok:true},{'Set-Cookie':'nocturna_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'})}
  if(req.method==='POST'&&url.pathname==='/api/admin/stories'){
    const input=await body(req);if(!validStory(input))return fail(res,400,'Revise os campos da história');
    const work=writeQueue.then(()=>saveStory(input));writeQueue=work.catch(()=>{});await work;return json(res,200,{ok:true});
  }
  if(req.method==='PATCH'&&/^\/api\/admin\/comments\/\d+$/.test(url.pathname)){
    const input=await body(req);if(!['approved','rejected','pending'].includes(input.status))return fail(res,400,'Estado inválido');
    const changed=store.updateComment(Number(url.pathname.split('/').pop()),input.status);return json(res,changed?200:404,{ok:changed});
  }
  if(req.method==='DELETE'&&/^\/api\/admin\/comments\/\d+$/.test(url.pathname)){
    const changed=store.deleteComment(Number(url.pathname.split('/').pop()));return json(res,changed?200:404,{ok:changed});
  }
  return fail(res,404,'Não encontrado');
}
async function staticFile(req,res,url){if(req.method!=='GET'&&req.method!=='HEAD')return fail(res,405,'Método inválido');let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{return fail(res,400,'Endereço inválido')}if(pathname.includes('\0')||pathname.split('/').includes('..'))return fail(res,400,'Endereço inválido');let target=resolve(dist,'.'+pathname);if(!target.startsWith(dist+sep)&&target!==dist)return fail(res,403,'Acesso negado');let info;try{info=await stat(target);if(info.isDirectory())target=join(target,'index.html');info=await stat(target)}catch{return fail(res,404,'Página indisponível')}if(!info.isFile())return fail(res,404,'Página indisponível');const bytes=await readFile(target);res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':pathname.startsWith('/admin')?'no-store':'no-cache'});res.end(req.method==='HEAD'?undefined:bytes)}
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');if(url.pathname.startsWith('/api/'))await api(req,res,url);else await staticFile(req,res,url)}catch(error){console.error(error);fail(res,error.message==='too large'?413:500,'Não foi possível concluir a solicitação')}});
const port=Number(process.env.PORT||8000);server.on('error',error=>{if(error.code==='EADDRINUSE')console.error(`A porta ${port} já está ocupada. Pare o servidor anterior (Ctrl+C) e tente novamente.`);else console.error(error);process.exitCode=1});server.listen(port,'127.0.0.1',()=>console.log(`Nocturna local: http://localhost:${port}/`));
