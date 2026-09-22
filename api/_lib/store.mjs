import { neon } from '@neondatabase/serverless';

let client;

function sql() {
  if (!process.env.DATABASE_URL) throw new Error('database not configured');
  client ||= neon(process.env.DATABASE_URL);
  return client;
}

function decode(row) {
  return typeof row.story === 'string' ? JSON.parse(row.story) : row.story;
}

export async function publicStories() {
  const rows = await sql()`SELECT story FROM stories WHERE status = 'published' ORDER BY (story->>'publishedAt') DESC, slug`;
  return rows.map(decode);
}

export async function storyBySlug(slug, publishedOnly = true) {
  const rows = publishedOnly
    ? await sql()`SELECT story FROM stories WHERE slug = ${slug} AND status = 'published'`
    : await sql()`SELECT story FROM stories WHERE slug = ${slug}`;
  return rows[0] ? decode(rows[0]) : null;
}

export async function allStories() {
  return (await sql()`SELECT story FROM stories ORDER BY (story->>'updatedAt') DESC, slug`).map(decode);
}

export async function saveStory(story) {
  await sql()`INSERT INTO stories (slug, status, story, updated_at) VALUES (${story.slug}, ${story.status}, ${JSON.stringify(story)}::jsonb, now()) ON CONFLICT (slug) DO UPDATE SET status = EXCLUDED.status, story = EXCLUDED.story, updated_at = now()`;
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
  const rows = await sql()`INSERT INTO request_limits (key, count, reset_at) VALUES (${key}, 1, now() + ${seconds} * interval '1 second') ON CONFLICT (key) DO UPDATE SET count = CASE WHEN request_limits.reset_at < now() THEN 1 ELSE request_limits.count + 1 END, reset_at = CASE WHEN request_limits.reset_at < now() THEN now() + ${seconds} * interval '1 second' ELSE request_limits.reset_at END RETURNING count`;
  return Number(rows[0].count) <= maximum;
}
