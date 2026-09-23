export const SITE_URL = 'https://portalnocturna.com.br';

const route = { pt: 'historias', en: 'stories', es: 'historias' };
const locale = { pt: 'pt-BR', en: 'en', es: 'es' };
const labels = {
  pt: { back: 'Voltar ao atlas', place: 'Ver histórias deste lugar', classification: 'Classificação', documented: 'Documentado', unverified: 'Relato não verificado', fiction: 'Ficção', sources: 'Fontes', explore: 'Explore mais', exploreNote: 'Estes links ajudam a investigar o contexto; eles não confirmam, por si só, as alegações da história.', privacy: 'Privacidade', footer: 'Sem cadastro. Localização opcional.' },
  en: { back: 'Back to the atlas', place: 'See stories from this place', classification: 'Classification', documented: 'Documented', unverified: 'Unverified account', fiction: 'Fiction', sources: 'Sources', explore: 'Explore further', exploreNote: 'These links help investigate the context; they do not, by themselves, confirm the story’s claims.', privacy: 'Privacy', footer: 'No account. Location is optional.' },
  es: { back: 'Volver al atlas', place: 'Ver historias de este lugar', classification: 'Clasificación', documented: 'Documentado', unverified: 'Relato no verificado', fiction: 'Ficción', sources: 'Fuentes', explore: 'Explora más', exploreNote: 'Estos enlaces ayudan a investigar el contexto; por sí solos no confirman las afirmaciones de la historia.', privacy: 'Privacidad', footer: 'Sin cuenta. Ubicación opcional.' },
};
const resourceType = {
  document: { pt: 'Documento', en: 'Document', es: 'Documento' },
  image: { pt: 'Imagem', en: 'Image', es: 'Imagen' },
  audio: { pt: 'Áudio', en: 'Audio', es: 'Audio' },
  video: { pt: 'Vídeo', en: 'Video', es: 'Vídeo' },
  reading: { pt: 'Leitura', en: 'Reading', es: 'Lectura' },
};
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
    const base = key.replace(/\|/g, '-').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = base;
    for (let number = 2; used.has(slug); number++) slug = `${base}-${number}`;
    used.add(slug);
    return { ...group, slug };
  });
}

export function languageLinks(slug) {
  return ['pt', 'en', 'es'].map(lang => `<link rel="alternate" hreflang="${locale[lang]}" href="${storyUrl(lang, slug)}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${storyUrl('pt', slug)}">`;
}

export function storyPage(story, lang, localitySlug = groupPlaces([story])[0].slug) {
  const copy = story.translations[lang];
  const words = labels[lang];
  const canonical = storyUrl(lang, story.slug);
  const title = `${copy.title} — Nocturna`;
  const titleEscaped = escapeHtml(title);
  const description = escapeHtml(copy.summary);
  const nav = ['pt', 'en', 'es'].map(code => `<a href="${storyUrl(code, story.slug)}"${code === lang ? ' aria-current="page"' : ''}>${code.toUpperCase()}</a>`).join('');
  const paragraphs = copy.body.replace(/\r\n/g, '\n').split(/\n\s*\n/).filter(Boolean).map(paragraph => `<p>${escapeHtml(paragraph.trim())}</p>`).join('');
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
<header class="masthead"><a class="brand" href="/${lang}/"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a><nav class="article-languages" aria-label="Languages">${nav}</nav></header>
<main class="legal"><a class="back" href="/${lang}/">← ${words.back}</a>
<p class="eyebrow">${words.classification}: ${words[story.classification]}</p>
<h1>${escapeHtml(copy.title)}</h1><p>${escapeHtml(copy.summary)}</p>
<p><a href="${placeUrl(lang, localitySlug)}">${escapeHtml(story.place.city)}, ${escapeHtml(story.place.region)}, ${escapeHtml(story.place.country)} — ${words.place}</a></p>
${paragraphs}${sources}${explore}
<section id="comments" class="comments" data-story="${escapeHtml(story.slug)}" data-lang="${lang}"></section></main>
<footer><a class="footer-brand brand" href="/${lang}/" aria-label="Nocturna"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a><span>${words.footer} <a href="/${lang}/privacidade.html">${words.privacy}</a></span></footer>
</div></body></html>`;
}

export function placePage(group, lang) {
  const name = [group.place.city, group.place.region, group.place.country].join(', ');
  const title = { pt: `Histórias de ${name} — Nocturna`, en: `Stories from ${name} — Nocturna`, es: `Historias de ${name} — Nocturna` }[lang];
  const description = { pt: `Explore as histórias publicadas de ${name}.`, en: `Explore published stories from ${name}.`, es: `Explora las historias publicadas de ${name}.` }[lang];
  const canonical = placeUrl(lang, group.slug);
  const alternates = ['pt', 'en', 'es'].map(code => `<link rel="alternate" hreflang="${locale[code]}" href="${placeUrl(code, group.slug)}">`).join('');
  const nav = ['pt', 'en', 'es'].map(code => `<a href="${placeUrl(code, group.slug)}"${code === lang ? ' aria-current="page"' : ''}>${code.toUpperCase()}</a>`).join('');
  const articles = group.stories.map(story => `<article class="place-story"><h2><a href="${storyUrl(lang, story.slug)}">${escapeHtml(story.translations[lang].title)}</a></h2><p>${escapeHtml(story.translations[lang].summary)}</p></article>`).join('');
  const structured = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, inLanguage: locale[lang], url: canonical, mainEntity: { '@type': 'ItemList', itemListElement: group.stories.map((story, index) => ({ '@type': 'ListItem', position: index + 1, url: storyUrl(lang, story.slug) })) } }).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="${locale[lang]}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#080d14"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">${alternates}<link rel="alternate" hreflang="x-default" href="${placeUrl('pt', group.slug)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Nocturna"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary">
<script type="application/ld+json">${structured}</script><link rel="stylesheet" href="/styles.css">${privacyScript}</head>
<body><div class="shell"><header class="masthead"><a class="brand" href="/${lang}/"><span class="brand-mark" aria-hidden="true">✦</span><span>NOCTURNA</span></a><nav class="article-languages" aria-label="Languages">${nav}</nav></header>
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
