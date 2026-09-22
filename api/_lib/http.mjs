import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
});

export const failure = (message, status = 400) => json({ error: message }, status);

export async function input(request, limit = 30_000) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > limit) throw new Error('too large');
  const text = await request.text();
  if (text.length > limit) throw new Error('too large');
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

export function validStory(story) {
  if (!story || typeof story !== 'object' || !/^([a-z0-9]+)(-[a-z0-9]+)*$/.test(story.slug || '')) return false;
  if (!['draft', 'review', 'published'].includes(story.status) || !['documented', 'unverified', 'fiction'].includes(story.classification)) return false;
  const place = story.place || {};
  if (!['city', 'region', 'country'].every(key => typeof place[key] === 'string' && place[key].trim()) || !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude) || Math.abs(place.latitude) > 90 || Math.abs(place.longitude) > 180) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(story.publishedAt || '') || !/^\d{4}-\d{2}-\d{2}$/.test(story.updatedAt || '')) return false;
  if (!Array.isArray(story.sources) || story.sources.length > 10 || !story.sources.every(source => typeof source.title === 'string' && source.title.trim() && source.title.length < 200 && typeof source.url === 'string' && /^https:\/\//.test(source.url))) return false;
  if (story.explore !== undefined && (!Array.isArray(story.explore) || story.explore.length > 10 || !story.explore.every(item => ['document', 'image', 'audio', 'video', 'reading'].includes(item.kind) && typeof item.url === 'string' && /^https:\/\//.test(item.url) && ['pt', 'en', 'es'].every(lang => typeof item.labels?.[lang] === 'string' && item.labels[lang].trim() && item.labels[lang].length < 200)))) return false;
  return ['pt', 'en', 'es'].every(lang => ['title', 'summary', 'body'].every(key => typeof story.translations?.[lang]?.[key] === 'string' && story.translations[lang][key].trim() && story.translations[lang][key].length < 15_000));
}
