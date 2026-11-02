// Páginas institucionais, rodapé e cartões de dossiês compartilhados.
// Usado por app.js (navegador), api/_lib/seo.mjs (páginas geradas na Vercel) e scripts/build.mjs (página inicial).
// build_pages.py tem equivalentes (SITE_PAGES e site_footer_links) para as páginas estáticas.

import { plainText } from './markdown.js';

export const storyRoute = { pt: 'historias', en: 'stories', es: 'historias' };

export const sitePages = {
  archive: { pt: '/pt/historias/', en: '/en/stories/', es: '/es/historias/' },
  about: { pt: '/pt/sobre.html', en: '/en/about.html', es: '/es/acerca.html' },
  contact: { pt: '/pt/contato.html', en: '/en/contact.html', es: '/es/contacto.html' },
  privacy: { pt: '/pt/privacidade.html', en: '/en/privacidade.html', es: '/es/privacidade.html' },
};

export const siteLabels = {
  pt: { archive: 'Todos os dossiês', about: 'Sobre', contact: 'Contato', privacy: 'Privacidade', footerNav: 'Páginas do site', documented: 'Documentado', unverified: 'Relato não verificado', fiction: 'Ficção' },
  en: { archive: 'All dossiers', about: 'About', contact: 'Contact', privacy: 'Privacy', footerNav: 'Site pages', documented: 'Documented', unverified: 'Unverified account', fiction: 'Fiction' },
  es: { archive: 'Todos los dosieres', about: 'Acerca de', contact: 'Contacto', privacy: 'Privacidad', footerNav: 'Páginas del sitio', documented: 'Documentado', unverified: 'Relato no verificado', fiction: 'Ficción' },
};

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function footerLinks(lang) {
  const words = siteLabels[lang];
  return `<nav class="footer-links" aria-label="${words.footerNav}">${['archive', 'about', 'contact', 'privacy'].map(page => `<a href="${sitePages[page][lang]}">${words[page]}</a>`).join('')}</nav>`;
}

export function storyPath(lang, slug) {
  return `/${lang}/${storyRoute[lang]}/${encodeURIComponent(slug)}/`;
}

// Cartão de dossiê (página inicial e lista completa): classificação, local, título com link e resumo.
export function storyCard(story, lang, heading = 'h3') {
  const copy = story.translations[lang];
  const place = [story.place.city, story.place.country].filter(Boolean).join(', ');
  return `<article class="story-card"><p class="eyebrow">${siteLabels[lang][story.classification]} · ${escapeHtml(place)}</p><${heading}><a href="${storyPath(lang, story.slug)}">${escapeHtml(plainText(copy.title))}</a></${heading}><p>${escapeHtml(plainText(copy.summary))}</p></article>`;
}

export const RECENT_LIMIT = 12;

// Dossiês recentes da página inicial; a lista já vem ordenada (mais recentes primeiro).
export function recentStoriesHtml(stories, lang, limit = RECENT_LIMIT) {
  return stories.slice(0, limit).map(story => storyCard(story, lang)).join('');
}
