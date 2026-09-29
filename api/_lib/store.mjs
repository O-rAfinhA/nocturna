import { neon } from '@neondatabase/serverless';
import { publicPlace, resolvePlace } from '../../dist/maplink.js';

let client;

function sql() {
  if (!process.env.DATABASE_URL) throw new Error('database not configured');
  client ||= neon(process.env.DATABASE_URL);
  return client;
}

function decode(row) {
  return typeof row.story === 'string' ? JSON.parse(row.story) : row.story;
}

// Versão pública: local aproximado sai arredondado e sem Street View/endereço (ver dist/maplink.js).
function decodePublic(row) {
  const story = decode(row);
  return { ...story, place: publicPlace(resolvePlace(story.slug, story.place)) };
}

export async function publicStories() {
  const rows = await sql()`SELECT story FROM stories WHERE status = 'published' ORDER BY (story->>'publishedAt') DESC, slug`;
  return rows.map(decodePublic);
}

export async function storyBySlug(slug, publishedOnly = true) {
  const rows = publishedOnly
    ? await sql()`SELECT story FROM stories WHERE slug = ${slug} AND status = 'published'`
    : await sql()`SELECT story FROM stories WHERE slug = ${slug}`;
  return rows[0] ? (publishedOnly ? decodePublic(rows[0]) : decode(rows[0])) : null;
}

export async function allStories() {
  // Mais recentes primeiro: createdAt (definido pelo servidor ao criar); histórias antigas sem ele vêm depois, por data de publicação.
  return (await sql()`SELECT story FROM stories ORDER BY (story->>'createdAt') DESC NULLS LAST, (story->>'publishedAt') DESC, slug`).map(decode);
}

export async function saveStory(story) {
  // createdAt é do servidor: vale a data da criação; numa edição, preserva a original (ou continua ausente).
  const { createdAt, ...fields } = story;
  const created = { ...fields, createdAt: new Date().toISOString() };
  await sql()`INSERT INTO stories (slug, status, story, updated_at) VALUES (${story.slug}, ${story.status}, ${JSON.stringify(created)}::jsonb, now())
    ON CONFLICT (slug) DO UPDATE SET status = EXCLUDED.status, updated_at = now(),
      story = CASE WHEN stories.story ? 'createdAt' THEN (EXCLUDED.story - 'createdAt') || jsonb_build_object('createdAt', stories.story->'createdAt') ELSE EXCLUDED.story - 'createdAt' END`;
}

export async function deleteStory(slug) {
  // Os comentários da história são removidos junto (ON DELETE CASCADE).
  return (await sql()`DELETE FROM stories WHERE slug = ${slug} RETURNING slug`).length > 0;
}

export async function addComment(comment) {
  const rows = await sql()`INSERT INTO comments (slug, author, body, lang) VALUES (${comment.slug}, ${comment.author}, ${comment.body}, ${comment.lang}) RETURNING id`;
  return rows[0].id;
}

export async function approvedForStory(slug) {
  return sql()`SELECT id, author, body, lang, created_at FROM comments WHERE slug = ${slug} AND status = 'approved' ORDER BY created_at DESC LIMIT 100`;
}

export async function approvedRecent() {
  return sql()`SELECT id, slug, author, body, lang, created_at FROM comments WHERE status = 'approved' ORDER BY created_at DESC LIMIT 300`;
}

export async function allComments() {
  return sql()`SELECT id, slug, author, body, lang, status, created_at FROM comments ORDER BY created_at DESC LIMIT 250`;
}

export async function updateComment(id, status) {
  return (await sql()`UPDATE comments SET status = ${status} WHERE id = ${id} RETURNING id`).length > 0;
}

export async function deleteComment(id) {
  return (await sql()`DELETE FROM comments WHERE id = ${id} RETURNING id`).length > 0;
}

export async function createSession(tokenHash, csrf) {
  await sql()`DELETE FROM admin_sessions WHERE expires_at <= now()`;
  await sql()`INSERT INTO admin_sessions (token_hash, csrf, expires_at) VALUES (${tokenHash}, ${csrf}, now() + interval '12 hours')`;
}

export async function getSession(tokenHash) {
  if (!tokenHash) return null;
  const rows = await sql()`SELECT csrf FROM admin_sessions WHERE token_hash = ${tokenHash} AND expires_at > now()`;
  return rows[0] || null;
}

export async function removeSession(tokenHash) {
  if (tokenHash) await sql()`DELETE FROM admin_sessions WHERE token_hash = ${tokenHash}`;
}

export async function takeRate(key, maximum, seconds) {
  // Limpeza ocasional das janelas expiradas, para a tabela não crescer sem fim.
  if (Math.random() < 0.05) await sql()`DELETE FROM request_limits WHERE reset_at < now() - interval '1 day'`;
  const rows = await sql()`INSERT INTO request_limits (key, count, reset_at) VALUES (${key}, 1, now() + ${seconds} * interval '1 second') ON CONFLICT (key) DO UPDATE SET count = CASE WHEN request_limits.reset_at < now() THEN 1 ELSE request_limits.count + 1 END, reset_at = CASE WHEN request_limits.reset_at < now() THEN now() + ${seconds} * interval '1 second' ELSE request_limits.reset_at END RETURNING count`;
  return Number(rows[0].count) <= maximum;
}
