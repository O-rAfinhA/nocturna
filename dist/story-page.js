import { plainText, renderMarkdown } from './markdown.js';
const params = new URLSearchParams(location.search);
const storyPath = location.pathname.match(/^\/(pt|en|es)\/(?:historias|stories)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
const lang = storyPath?.[1] || (['pt', 'en', 'es'].includes(params.get('lang')) ? params.get('lang') : 'pt');
const slug = storyPath?.[2] || params.get('slug') || '';
const words = {
  pt: { streetView: 'Ver no Street View', googleMaps: 'Ver no Google Maps', approximate: 'Local aproximado', back: 'Voltar ao atlas', sources: 'Fontes', classification: 'Classificação', documented: 'Documentado', unverified: 'Relato não verificado', fiction: 'Ficção', explore: 'Explore mais', note: 'Estes links externos ajudam a investigar o contexto; eles não confirmam, por si só, as alegações da história.', privacy: 'Sem cadastro. Localização opcional. Privacidade', unavailable: 'Esta história não está disponível.' },
  en: { streetView: 'Open in Street View', googleMaps: 'Open in Google Maps', approximate: 'Approximate location', back: 'Back to the atlas', sources: 'Sources', classification: 'Classification', documented: 'Documented', unverified: 'Unverified account', fiction: 'Fiction', explore: 'Explore further', note: 'These external links help investigate the context; they do not, by themselves, confirm the story’s claims.', privacy: 'No account. Location is optional. Privacy', unavailable: 'This story is unavailable.' },
  es: { streetView: 'Ver en Street View', googleMaps: 'Ver en Google Maps', approximate: 'Ubicación aproximada', back: 'Volver al atlas', sources: 'Fuentes', classification: 'Clasificación', documented: 'Documentado', unverified: 'Relato no verificado', fiction: 'Ficción', explore: 'Explora más', note: 'Estos enlaces externos ayudan a investigar el contexto; por sí solos no confirman las afirmaciones de la historia.', privacy: 'Sin cuenta. Ubicación opcional. Privacidad', unavailable: 'Esta historia no está disponible.' },
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
  document.querySelector('#masthead-label').textContent = { pt: 'ATLAS DO INCOMUM', en: 'ATLAS OF THE UNUSUAL', es: 'ATLAS DE LO INSÓLITO' }[lang];
  const languageName = { pt: 'Idioma', en: 'Language', es: 'Idioma' }[lang];
  document.querySelector('#language-label').textContent = languageName;
  const menu = document.querySelector('#language-links');
  menu.setAttribute('aria-label', languageName);
  for (const option of ['pt', 'en', 'es']) {
    const item = element('option', option.toUpperCase());
    item.value = `/${option}/${routes[option]}/${encodeURIComponent(slug)}/`;
    if (option === lang) item.selected = true;
    menu.append(item);
  }
  menu.onchange = () => { location.href = menu.value; };
}

function render(story) {
  const source = story.translations[lang];
  const copy = { ...source, title: plainText(source.title), summary: plainText(source.summary) };
  document.title = `${copy.title} — Nocturna`;
  main.append(link(`/${lang}/`, `← ${words.back}`));
  main.lastElementChild.className = 'back';
  main.append(element('p', `${words.classification}: ${words[story.classification]}`, 'eyebrow'));
  main.append(element('h1', copy.title), element('p', copy.summary));
  main.append(element('p', `${story.place.city}, ${story.place.region}, ${story.place.country}`));
  const body = element('div', undefined, 'story-body'); body.innerHTML = renderMarkdown(copy.body); main.append(...body.childNodes);
  const location = element('p', undefined, 'story-map-link');
  const mapAnchor = link(story.place.streetViewUrl || `https://www.google.com/maps/search/?api=1&query=${story.place.latitude},${story.place.longitude}`, story.place.streetViewUrl ? words.streetView : words.googleMaps);
  mapAnchor.target = '_blank'; mapAnchor.rel = 'noopener noreferrer'; location.append(mapAnchor);
  if (story.place.precision !== 'exact') location.append(' ', element('span', `· ${words.approximate}`, 'location-note'));
  main.append(location);
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
