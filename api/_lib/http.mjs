import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
});

// Cache na CDN da Vercel para leituras públicas; o navegador sempre revalida.
export const PUBLIC_CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400';
export const SHORT_PUBLIC_CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=600';

// 3 idiomas × (título + resumo + texto até 60.000 caracteres), com folga para acentos (até 4 bytes) e fontes.
export const STORY_BYTES = 1_000_000;

export const failure = (message, status = 400) => json({ error: message }, status);

export async function input(request, limit = 30_000) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > limit) throw new Error('too large');
  const text = await request.text();
  if (Buffer.byteLength(text) > limit) throw new Error('too large');
  try { return JSON.parse(text || '{}'); } catch { throw new Error('invalid json'); }
}

export function sameOrigin(request) {
  const value = request.headers.get('origin');
  if (!value) return false;
  try {
    const origin = new URL(value);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    return Boolean(host) && origin.host === host && ['http:', 'https:'].includes(origin.protocol);
  } catch { return false; }
}

export const hash = value => createHash('sha256').update(value).digest('hex');
export const newToken = () => randomBytes(32).toString('hex');
export const newCsrf = () => randomBytes(24).toString('hex');

export function sessionToken(request) {
  return /(?:^|;\s*)nocturna_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.get('cookie') || '')?.[1];
}

export function sessionCookie(value, maxAge = 43_200) {
  return `nocturna_session=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function passwordIsValid(password) {
  const salt = process.env.ADMIN_PASSWORD_SALT || '';
  const expected = Buffer.from(process.env.ADMIN_PASSWORD_HASH || '', 'hex');
  if (!salt || expected.length !== 64) throw new Error('admin not configured');
  const actual = scryptSync(String(password || ''), Buffer.from(salt, 'hex'), 64);
  return timingSafeEqual(expected, actual);
}

// Domínios do Google Maps, incluindo os regionais (google.com.br, google.es, google.co.uk…).
const GOOGLE_MAPS_HOST = /^(?:www\.|maps\.)?google\.(?:com|[a-z]{2}|com?\.[a-z]{2})$/;

export function validStreetViewUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    if (url.hostname === 'maps.app.goo.gl') return true;
    return (url.hostname === 'goo.gl' || GOOGLE_MAPS_HOST.test(url.hostname)) && url.pathname.startsWith('/maps');
  } catch { return false; }
}

export const TEXT_LIMITS = { title: 500, summary: 5_000, body: 60_000 };
const LANGUAGE_NAMES = { pt: 'Português', en: 'English', es: 'Español' };
const FIELD_NAMES = { title: 'Título', summary: 'Resumo', body: 'Texto' };

// Retorna a descrição do primeiro problema encontrado, ou null quando a história é válida.
export function storyProblem(story) {
  if (!story || typeof story !== 'object') return 'História inválida.';
  if (!/^([a-z0-9]+)(-[a-z0-9]+)*$/.test(story.slug || '')) return 'Identificador da URL inválido: use apenas letras minúsculas sem acento, números e hífens.';
  if (!['draft', 'review', 'published'].includes(story.status)) return 'Situação inválida.';
  if (!['documented', 'unverified', 'fiction'].includes(story.classification)) return 'Classificação inválida.';
  const place = story.place || {};
  if (!['city', 'region', 'country'].every(key => typeof place[key] === 'string' && place[key].trim())) return 'Preencha cidade, região/estado e país.';
  if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude) || Math.abs(place.latitude) > 90 || Math.abs(place.longitude) > 180) return 'Latitude ou longitude inválida.';
  if (place.precision !== undefined && !['exact', 'approximate'].includes(place.precision)) return 'Precisão do local inválida.';
  if (place.streetViewUrl !== undefined && !validStreetViewUrl(place.streetViewUrl)) return 'Link do Street View inválido: cole um endereço do Google Maps que comece com https://.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(story.publishedAt || '') || !/^\d{4}-\d{2}-\d{2}$/.test(story.updatedAt || '')) return 'Datas de publicação ou atualização inválidas.';
  if (!Array.isArray(story.sources) || story.sources.length > 10) return 'Use no máximo 10 fontes.';
  for (const source of story.sources) {
    if (typeof source.title !== 'string' || !source.title.trim() || source.title.length >= 200) return 'Cada fonte precisa de um título com menos de 200 caracteres.';
    if (typeof source.url !== 'string' || !/^https:\/\//.test(source.url)) return `A URL da fonte “${source.title}” precisa começar com https://.`;
  }
  if (story.explore !== undefined) {
    if (!Array.isArray(story.explore) || story.explore.length > 10) return 'Use no máximo 10 links de exploração.';
    for (const item of story.explore) {
      if (!['document', 'image', 'audio', 'video', 'reading'].includes(item.kind)) return 'Tipo de link de exploração inválido.';
      if (typeof item.url !== 'string' || !/^https:\/\//.test(item.url)) return 'Cada link de exploração precisa de uma URL que comece com https://.';
      if (!['pt', 'en', 'es'].every(lang => typeof item.labels?.[lang] === 'string' && item.labels[lang].trim() && item.labels[lang].length < 200)) return 'Cada link de exploração precisa dos três títulos, com menos de 200 caracteres.';
    }
  }
  for (const lang of ['pt', 'en', 'es']) for (const key of ['title', 'summary', 'body']) {
    const value = story.translations?.[lang]?.[key];
    if (typeof value !== 'string' || !value.trim()) return `Preencha o campo ${FIELD_NAMES[key]} da aba ${LANGUAGE_NAMES[lang]}.`;
    if (value.length > TEXT_LIMITS[key]) return `O campo ${FIELD_NAMES[key]} da aba ${LANGUAGE_NAMES[lang]} tem ${value.length.toLocaleString('pt-BR')} caracteres; o limite é ${TEXT_LIMITS[key].toLocaleString('pt-BR')}.`;
  }
  return null;
}

export const validStory = story => storyProblem(story) === null;
