# Publicação na Vercel

Esta configuração publica as páginas estáticas em `dist/` e adiciona Functions para catálogo, comentários e administração. O servidor `server.mjs` continua exclusivo para uso local e preserva `data/` no computador.

O projeto da Vercel está conectado ao repositório `O-rAfinhA/nocturna`: cada push na branch `main` gera um deploy de produção, e as outras branches geram deploys de Preview. `vercel --prod` pela linha de comando continua possível, mas não é mais necessário.

## Antes do primeiro deploy

1. Crie um banco PostgreSQL no Neon e guarde a URL de conexão em `DATABASE_URL`.
2. No PowerShell, defina temporariamente a variável e execute `npm run db:migrate`. Isso cria as tabelas de histórias, comentários, sessões e limite de tentativas.
3. Ainda com a variável definida, execute `npm run db:import-content`. Esse comando copia o catálogo local para o banco, sem enviar a URL do banco nem as histórias em alterações futuras ao GitHub.
4. Execute `node setup-admin.mjs --vercel`. O comando grava as variáveis administrativas em `data/vercel-admin.env`; adicione os dois valores no painel da Vercel, sem subir o arquivo.
5. No projeto Vercel, configure `DATABASE_URL`, `ADMIN_PASSWORD_SALT` e `ADMIN_PASSWORD_HASH` para Preview e Production.
6. Faça um deploy de Preview e teste login, criação de rascunho, publicação, comentário pendente, aprovação e os três idiomas antes de associar domínio.

Depois de confirmar o catálogo no Preview, remova do índice Git o arquivo local `content/stories.json` e as páginas editoriais geradas. Eles já estão em `.gitignore`, portanto continuarão preservados no computador, mas não serão enviados em commits futuros. O painel passa a gravar exclusivamente no PostgreSQL.

## Geração das páginas

O `npm run build` executa `build_pages.py`. Na Vercel, a variável de sistema `VERCEL=1` faz o gerador produzir as páginas iniciais e de privacidade na versão pública: `index,follow`, canônicas, `hreflang` e Vercel Web Analytics condicionado ao aviso de privacidade. Sem essa variável (uso local), o gerador produz a versão de protótipo com `noindex`. Para forçar um modo, defina `NOCTURNA_STATIC_CATALOG=0` (público) ou `1` (local). Essas páginas não são versionadas no Git; são sempre geradas no build.

## Limite de Functions

O plano Hobby da Vercel aceita no máximo 12 Functions por deploy; cada arquivo `.mjs` em `api/` (fora de `api/_lib/`) conta como uma. Acima disso o deploy falha. Para novas rotas, prefira um `rewrite` no `vercel.json` para uma Function existente (como `/api/geo` → `api/page.mjs`). O teste `tests/vercel.test.mjs` verifica esse limite.

## Cache e cabeçalhos

As páginas de histórias, localidades, `/api/story` e `/sitemap.xml` usam cache da CDN por 5 minutos (`s-maxage=300`, com `stale-while-revalidate`). `/api/stories`, `/api/comments` e `/api/comments/regions` usam 1 minuto. Rotas administrativas continuam sem cache. Depois de publicar, retirar uma história ou aprovar um comentário, aguarde esse intervalo ou limpe o cache no painel da Vercel. O `vercel.json` também aplica `X-Frame-Options`, `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` e HSTS a todas as rotas, e `noindex` com `no-store` em `/admin/`.

## Rotas e mídia

As rotas de leitura e de localidades geram HTML completo na Function a partir das histórias publicadas no banco. Uma história recém-publicada fica acessível sem esperar outra geração completa. `/sitemap.xml` é atualizado a partir do mesmo catálogo. O deploy não inclui os textos editoriais nem páginas de histórias no repositório.

Guarde imagens, áudios e vídeos em Vercel Blob, S3 ou serviço equivalente. Não envie mídia pesada para o repositório nem para a resposta de uma Function.

## Limites e privacidade

O domínio canônico é `portalnocturna.com.br`. A Vercel confirmou os registros DNS da Hostinger e redireciona `www` para o domínio principal. A versão online só carrega Vercel Web Analytics após a escolha afirmativa no aviso de privacidade; a medição não usa cookies de análise. As páginas de privacidade descrevem essa escolha e informam o responsável e o contato público em PT/EN/ES. O aviso ainda não é uma CMP para anúncios. O Search Console é verificado na conta atual pela propriedade de domínio (registro TXT no DNS da Hostinger); o site não tem mais metatag de verificação. O `dist/ads.txt` contém a linha da conta AdSense atual (`pub-8367079943939080`); a conta anterior, duplicada, foi removida e a revisão do site deve ser solicitada na conta atual. Anúncios não estão ativos. Google Analytics ainda depende de configuração própria. A pasta `data/`, os arquivos `.env` e as credenciais administrativas permanecem privados e nunca devem ser enviados ao repositório.
