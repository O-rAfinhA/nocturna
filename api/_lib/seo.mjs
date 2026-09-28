import { createHash } from 'node:crypto';

export const SITE_URL = 'https://portalnocturna.com.br';

const route = { pt: 'historias', en: 'stories', es: 'historias' };
const locale = { pt: 'pt-BR', en: 'en', es: 'es' };
const labels = {
  pt: { streetView: 'Ver no Street View', googleMaps: 'Ver no Google Maps', approximate: 'Local aproximado', back: 'Voltar ao atlas', place: 'Ver histórias deste lugar e arredores', nearby: 'Histórias próximas', here: 'Neste lugar', classification: 'Classificação', documented: 'Documentado', unverified: 'Relato não verificado', fiction: 'Ficção', sources: 'Fontes', explore: 'Explore mais', exploreNote: 'Estes links ajudam a investigar o contexto; eles não confirmam, por si só, as alegações da história.', privacy: 'Privacidade', footer: 'Sem cadastro. Localização opcional.' },
  en: { streetView: 'Open in Street View', googleMaps: 'Open in Google Maps', approximate: 'Approximate location', back: 'Back to the atlas', place: 'See stories from this place and nearby', nearby: 'Nearby stories', here: 'In this place', classification: 'Classification', documented: 'Documented', unverified: 'Unverified account', fiction: 'Fiction', sources: 'Sources', explore: 'Explore further', exploreNote: 'These links help investigate the context; they do not, by themselves, confirm the story’s claims.', privacy: 'Privacy', footer: 'No account. Location is optional.' },
  es: { streetView: 'Ver en Street View', googleMaps: 'Ver en Google Maps', approximate: 'Ubicación aproximada', back: 'Volver al atlas', place: 'Ver historias de este lugar y alrededores', nearby: 'Historias cercanas', here: 'En este lugar', classification: 'Clasificación', documented: 'Documentado', unverified: 'Relato no verificado', fiction: 'Ficción', sources: 'Fuentes', explore: 'Explora más', exploreNote: 'Estos enlaces ayudan a investigar el contexto; por sí solos no confirman las afirmaciones de la historia.', privacy: 'Privacidad', footer: 'Sin cuenta. Ubicación opcional.' },
};
const resourceType = {
  document: { pt: 'Documento', en: 'Document', es: 'Documento' },
  image: { pt: 'Imagem', en: 'Image', es: 'Imagen' },
  audio: { pt: 'Áudio', en: 'Audio', es: 'Audio' },
  video: { pt: 'Vídeo', en: 'Video', es: 'Vídeo' },
  reading: { pt: 'Leitura', en: 'Reading', es: 'Lectura' },
};
const masthead = { pt: 'ATLAS DO INCOMUM', en: 'ATLAS OF THE UNUSUAL', es: 'ATLAS DE LO INSÓLITO' };
const languageName = { pt: 'Idioma', en: 'Language', es: 'Idioma' };

// Mesmo cabeçalho da página inicial: rótulo e menu suspenso com o idioma atual.
export function languageMenu(lang, pathFor) {
  const options = ['pt', 'en', 'es'].map(code => `<option value="${escapeHtml(pathFor(code))}"${code === lang ? ' selected' : ''}>${code.toUpperCase()}</option>`).join('');
  return `<div class="header-right"><span class="masthead-label">${masthead[lang]}</span><label class="language"><span class="sr-only">${languageName[lang]}</span><select aria-label="${languageName[lang]}" onchange="location.href=this.value">${options}</select></label></div>`;
}

const privacyScript = '<script defer src="/privacy.js" data-analytics="vercel"></script>';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function storyUrl(lang, slug) {
  return `${SITE_URL}/${lang}/${route[lang]}/${encodeURIComponent(slug)}/`;
}

const placeRoute = { pt: 'locais', en: 'places', es: 'lugares' };

export function placeUrl(lang, slug) {
  return `${SITE_URL}/${lang}/${placeRoute[lang]}/${encodeURIComponent(slug)}/`;
}

export function groupPlaces(stories) {
  const groups = new Map();
  for (const story of stories) {
    const place = story.place;
    const key = [place.city, place.region, place.country].map(value => value.trim().toLocaleLowerCase('pt-BR')).join('|');
    if (!groups.has(key)) groups.set(key, { place, stories: [] });
    groups.get(key).stories.push(story);
  }
  const used = new Set();
  return [...groups].sort(([a], [b]) => a.localeCompare(b, 'pt-BR')).map(([key, group]) => {
    const base = key.replace(/\|/g, '-').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      || `lugar-${createHash('sha256').update(key).digest('hex').slice(0, 10)}`;
    let slug = base;
    for (let number = 2; used.has(slug); number++) slug = `${base}-${number}`;
    used.add(slug);
    return { ...group, slug };
  });
}

export function localitySlugFor(story, stories = [story]) {
  return groupPlaces(stories).find(group => group.stories.some(item => item.slug === story.slug))?.slug || groupPlaces([story])[0].slug;
}

export function languageLinks(slug) {
  return ['pt', 'en', 'es'].map(lang => `<link rel="alternate" hreflang="${locale[lang]}" href="${storyUrl(lang, slug)}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${storyUrl('pt', slug)}">`;
}

export function mapLink(place) {
  return place.streetViewUrl || `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
}

export function storyPage(story, lang, localitySlug = localitySlugFor(story)) {
  const copy = story.translations[lang];
  const words = labels[lang];
  const canonical = storyUrl(lang, story.slug);
  const title = `${copy.title} — Nocturna`;
  const titleEscaped = escapeHtml(title);
  const description = escapeHtml(copy.summary);
  const nav = languageMenu(lang, code => `/${code}/${route[code]}/${encodeURIComponent(story.slug)}/`);
  const paragraphs = copy.body.replace(/\r\n/g, '\n').split(/\n\s*\n/).filter(Boolean).map(paragraph => `<p>${escapeHtml(paragraph.trim())}</p>`).join('');
  const mapLabel = story.place.streetViewUrl ? words.streetView : words.googleMaps;
  const location = `<p class="story-map-link"><a href="${escapeHtml(mapLink(story.place))}" target="_blank" rel="noopener noreferrer">${mapLabel}</a>${story.place.precision === 'exact' ? '' : ` <span class="location-note">· ${words.approximate}</span>`}</p>`;
  const sources = story.sources.length ? `<section aria-labelledby="sources-heading"><h2 id="sources-heading">${words.sources}</h2><ul>${story.sources.map(item => `<li><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></li>`).join('')}</ul></section>` : '';
  const explore = story.explore?.length ? `<section class="story-explore" aria-labelledby="explore-heading"><h2 id="explore-heading">${words.explore}</h2><p>${words.exploreNote}</p><ul>${story.explore.map(item => `<li><span class="resource-kind">${resourceType[item.kind][lang]}</span><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.labels[lang])}</a></li>`).join('')}</ul></section>` : '';
  const structured = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: copy.title,
    description: copy.summary, inLanguage: locale[lang],
    datePublished: story.publishedAt, dateModified: story.updatedAt,
    mainEntityOfPage: canonical,
    author: { '@type': 'Organization', name: 'Nocturna', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Nocturna', url: SITE_URL },
  }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="${locale[lang]}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#080d14">
<title>${titleEscaped}</title><meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">${languageLinks(story.slug)}
<meta property="og:type" content="article"><meta property="og:site_name" content="Nocturna">
<meta property="og:title" content="${titleEscaped}"><meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}"><meta property="og:locale" content="${locale[lang]}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${titleEscaped}"><meta name="twitter:description" content="${description}">
<script type="application/ld+json">${structured}</script>
<link rel="stylesheet" href="/styles.css"><script type="module" src="/comments.js"></script>${privacyScript}
</head><body><div class="shell">
<header class="masthead"><a class="brand" href="/${lang}/"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a>${nav}</header>
<main class="legal"><a class="back" href="/${lang}/">← ${words.back}</a>
<p class="eyebrow">${words.classification}: ${words[story.classification]}</p>
<h1>${escapeHtml(copy.title)}</h1><p>${escapeHtml(copy.summary)}</p>
<p><a href="${placeUrl(lang, localitySlug)}">${escapeHtml(story.place.city)}, ${escapeHtml(story.place.region)}, ${escapeHtml(story.place.country)} — ${words.place}</a></p>
${paragraphs}${location}${sources}${explore}
<section id="comments" class="comments" data-story="${escapeHtml(story.slug)}" data-lang="${lang}"></section></main>
<footer><a class="footer-brand brand" href="/${lang}/" aria-label="Nocturna"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a><span>${words.footer} <a href="/${lang}/privacidade.html">${words.privacy}</a></span></footer>
</div></body></html>`;
}

// Histórias próximas de um lugar: todas até NEARBY_KM; se forem menos de NEARBY_MIN, completa com as mais próximas.
export const NEARBY_KM = 300;
const NEARBY_MIN = 3, NEARBY_MAX = 12;

export function distanceKm(a, b) {
  const rad = Math.PI / 180, dLat = (b.latitude - a.latitude) * rad, dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function nearbyStories(group, stories) {
  const own = new Set(group.stories.map(story => story.slug));
  const ranked = stories.filter(story => !own.has(story.slug)).map(story => ({ story, km: distanceKm(group.place, story.place) })).sort((a, b) => a.km - b.km || a.story.slug.localeCompare(b.story.slug));
  const close = ranked.filter(item => item.km <= NEARBY_KM);
  return (close.length >= NEARBY_MIN ? close : ranked.slice(0, NEARBY_MIN)).slice(0, NEARBY_MAX);
}

export function placePage(group, lang, stories = group.stories) {
  const name = [group.place.city, group.place.region, group.place.country].join(', ');
  const title = { pt: `Histórias de ${name} — Nocturna`, en: `Stories from ${name} — Nocturna`, es: `Historias de ${name} — Nocturna` }[lang];
  const description = { pt: `Explore as histórias publicadas de ${name} e arredores.`, en: `Explore published stories from ${name} and nearby.`, es: `Explora las historias publicadas de ${name} y alrededores.` }[lang];
  const canonical = placeUrl(lang, group.slug);
  const alternates = ['pt', 'en', 'es'].map(code => `<link rel="alternate" hreflang="${locale[code]}" href="${placeUrl(code, group.slug)}">`).join('');
  const nav = languageMenu(lang, code => `/${code}/${placeRoute[code]}/${encodeURIComponent(group.slug)}/`);
  const words = labels[lang];
  const card = (story, meta) => `<article class="place-story">${meta ? `<p class="eyebrow">${meta}</p>` : ''}<h2><a href="${storyUrl(lang, story.slug)}">${escapeHtml(story.translations[lang].title)}</a></h2><p>${escapeHtml(story.translations[lang].summary)}</p></article>`;
  const nearby = nearbyStories(group, stories);
  const number = new Intl.NumberFormat(locale[lang], { maximumFractionDigits: 0 });
  const articles = `<section class="place-group" aria-labelledby="here-heading"><h2 id="here-heading" class="place-group-heading">${words.here}</h2>${group.stories.map(story => card(story)).join('')}</section>`
    + (nearby.length ? `<section class="place-group" aria-labelledby="nearby-heading"><h2 id="nearby-heading" class="place-group-heading">${words.nearby}</h2>${nearby.map(({ story, km }) => card(story, `${number.format(km)} km · ${escapeHtml(story.place.city)}`)).join('')}</section>` : '');
  const structured = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, inLanguage: locale[lang], url: canonical, mainEntity: { '@type': 'ItemList', itemListElement: group.stories.map((story, index) => ({ '@type': 'ListItem', position: index + 1, url: storyUrl(lang, story.slug) })) } }).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="${locale[lang]}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#080d14"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">${alternates}<link rel="alternate" hreflang="x-default" href="${placeUrl('pt', group.slug)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Nocturna"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary">
<script type="application/ld+json">${structured}</script><link rel="stylesheet" href="/styles.css">${privacyScript}</head>
<body><div class="shell"><header class="masthead"><a class="brand" href="/${lang}/"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a>${nav}</header>
<main class="legal place-page"><a class="back" href="/${lang}/">← ${labels[lang].back}</a><h1>${escapeHtml(title.replace(/ — Nocturna$/, ''))}</h1><p>${escapeHtml(description)}</p>${articles}</main>
<footer><a class="footer-brand brand" href="/${lang}/" aria-label="Nocturna"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a><span>${labels[lang].footer} <a href="/${lang}/privacidade.html">${labels[lang].privacy}</a></span></footer>
</div></body></html>`;
}

export function sitemap(stories) {
  const langs = ['pt', 'en', 'es'];
  const entry = (url, alternatives, modified) => {
    const links = langs.map(lang => `<xhtml:link rel="alternate" hreflang="${locale[lang]}" href="${escapeHtml(alternatives[lang])}"/>`).join('');
    return `<url><loc>${escapeHtml(url)}</loc>${modified ? `<lastmod>${escapeHtml(modified)}</lastmod>` : ''}${links}</url>`;
  };
  const home = Object.fromEntries(langs.map(lang => [lang, `${SITE_URL}/${lang}/`]));
  const urls = langs.map(lang => entry(home[lang], home));
  const privacy = Object.fromEntries(langs.map(lang => [lang, `${SITE_URL}/${lang}/privacidade.html`]));
  for (const lang of langs) urls.push(entry(privacy[lang], privacy));
  for (const story of stories) {
    const alternatives = Object.fromEntries(langs.map(lang => [lang, storyUrl(lang, story.slug)]));
    for (const lang of langs) urls.push(entry(alternatives[lang], alternatives, story.updatedAt));
  }
  for (const place of groupPlaces(stories)) {
    const alternatives = Object.fromEntries(langs.map(lang => [lang, placeUrl(lang, place.slug)]));
    const modified = place.stories.map(story => story.updatedAt).sort().at(-1);
    for (const lang of langs) urls.push(entry(alternatives[lang], alternatives, modified));
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`;
}
