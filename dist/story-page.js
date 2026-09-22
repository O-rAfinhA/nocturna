const params = new URLSearchParams(location.search);
const lang = ['pt', 'en', 'es'].includes(params.get('lang')) ? params.get('lang') : 'pt';
const slug = params.get('slug') || '';
const words = {
  pt: { back: 'Voltar ao atlas', sources: 'Fontes', classification: 'Classificação', documented: 'Documentado', unverified: 'Relato não verificado', fiction: 'Ficção', explore: 'Explore mais', note: 'Estes links externos ajudam a investigar o contexto; eles não confirmam, por si só, as alegações da história.', privacy: 'Sem cadastro. Localização opcional. Privacidade', unavailable: 'Esta história não está disponível.' },
  en: { back: 'Back to the atlas', sources: 'Sources', classification: 'Classification', documented: 'Documented', unverified: 'Unverified account', fiction: 'Fiction', explore: 'Explore further', note: 'These external links help investigate the context; they do not, by themselves, confirm the story’s claims.', privacy: 'No account. Location is optional. Privacy', unavailable: 'This story is unavailable.' },
  es: { back: 'Volver al atlas', sources: 'Fuentes', classification: 'Clasificación', documented: 'Documentado', unverified: 'Relato no verificado', fiction: 'Ficción', explore: 'Explora más', note: 'Estos enlaces externos ayudan a investigar el contexto; por sí solos no confirman las afirmaciones de la historia.', privacy: 'Sin cuenta. Ubicación opcional. Privacidad', unavailable: 'Esta historia no está disponible.' },
}[lang];
const footerWords = {
  pt: { note: 'Sem cadastro. Localização opcional.', privacy: 'Privacidade' },
  en: { note: 'No account. Location is optional.', privacy: 'Privacy' },
  es: { note: 'Sin cuenta. Ubicación opcional.', privacy: 'Privacidad' },
}[lang];
const types = { document: { pt: 'Documento', en: 'Document', es: 'Documento' }, image: { pt: 'Imagem', en: 'Image', es: 'Imagen' }, audio: { pt: 'Áudio', en: 'Audio', es: 'Audio' }, video: { pt: 'Vídeo', en: 'Video', es: 'Vídeo' }, reading: { pt: 'Leitura', en: 'Reading', es: 'Lectura' } };
const routes = { pt: 'historias', en: 'stories', es: 'historias' };
const main = document.querySelector('#article');

function element(name, text, className) {
  const node = document.createElement(name);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function link(href, text) {
  const node = element('a', text);
  node.href = href;
  return node;
}

function pageLinks() {
  document.documentElement.lang = { pt: 'pt-BR', en: 'en', es: 'es' }[lang];
  document.querySelector('#home-link').href = `/${lang}/`;
  document.querySelector('#footer-home-link').href = `/${lang}/`;
  const footer = document.querySelector('#footer-copy');
  footer.append(`${footerWords.note} `, link(`/${lang}/privacidade.html`, footerWords.privacy));
  const links = document.querySelector('#language-links');
  for (const option of ['pt', 'en', 'es']) {
    const item = link(`/${option}/${routes[option]}/${encodeURIComponent(slug)}/`, option.toUpperCase());
    if (option === lang) item.setAttribute('aria-current', 'page');
    links.append(item);
  }
}

function render(story) {
  const copy = story.translations[lang];
  document.title = `${copy.title} — Nocturna`;
  main.append(link(`/${lang}/`, `← ${words.back}`));
  main.lastElementChild.className = 'back';
  main.append(element('p', `${words.classification}: ${words[story.classification]}`, 'eyebrow'));
  main.append(element('h1', copy.title), element('p', copy.summary));
  main.append(element('p', `${story.place.city}, ${story.place.region}, ${story.place.country}`));
  for (const paragraph of copy.body.split('\n\n')) if (paragraph.trim()) main.append(element('p', paragraph));
  if (story.sources.length) {
    main.append(element('h2', words.sources));
    const list = element('ul');
    for (const source of story.sources) { const item = element('li'); const itemLink = link(source.url, source.title); itemLink.rel = 'noopener noreferrer'; itemLink.target = '_blank'; item.append(itemLink); list.append(item); }
    main.append(list);
  }
  if (story.explore?.length) {
    const section = element('section', undefined, 'story-explore'); section.append(element('h2', words.explore), element('p', words.note));
    const list = element('ul');
    for (const resource of story.explore) { const item = element('li'); item.append(element('span', types[resource.kind][lang], 'resource-kind')); const itemLink = link(resource.url, resource.labels[lang]); itemLink.target = '_blank'; itemLink.rel = 'noopener noreferrer'; item.append(itemLink); list.append(item); }
    section.append(list); main.append(section);
  }
  const comments = element('section', undefined, 'comments'); comments.id = 'comments'; comments.dataset.story = story.slug; comments.dataset.lang = lang; main.append(comments);
  const script = document.createElement('script'); script.type = 'module'; script.src = '/comments.js'; document.body.append(script);
}

pageLinks();
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) main.append(element('p', words.unavailable));
else fetch(`/api/story?slug=${encodeURIComponent(slug)}`).then(response => response.ok ? response.json() : Promise.reject()).then(({ story }) => render(story)).catch(() => main.append(element('p', words.unavailable)));
