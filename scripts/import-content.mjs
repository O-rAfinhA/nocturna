import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
import { validStory } from '../api/_lib/http.mjs';

if (!process.env.DATABASE_URL) {
  console.error('Defina DATABASE_URL antes de importar o catálogo.');
  process.exitCode = 1;
} else {
  const file = new URL('../content/stories.json', import.meta.url);
  const stories = JSON.parse(await readFile(file, 'utf8'));
  if (!Array.isArray(stories) || !stories.every(validStory)) throw new Error('content/stories.json contém uma história inválida.');
  const sql = neon(process.env.DATABASE_URL);
  for (const story of stories) {
    await sql`INSERT INTO stories (slug, status, story, updated_at) VALUES (${story.slug}, ${story.status}, ${JSON.stringify(story)}::jsonb, now()) ON CONFLICT (slug) DO UPDATE SET status = EXCLUDED.status, story = EXCLUDED.story, updated_at = now()`;
  }
  console.log(`${stories.length} histórias importadas para o banco.`);
}
