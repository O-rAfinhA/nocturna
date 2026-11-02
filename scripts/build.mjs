import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { RECENT_LIMIT, recentStoriesHtml, sitePages } from '../dist/site-links.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const command = process.platform === 'win32' ? 'py' : 'python3';
const args = process.platform === 'win32' ? ['-3', 'build_pages.py'] : ['build_pages.py'];
const python = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
if (python.error) { console.error(python.error.message); process.exit(1); }
if (python.status !== 0) process.exit(python.status || 1);

// Mesma regra de build_pages.py: na Vercel (VERCEL=1) o catálogo vem do banco; localmente, de content/stories.json.
const staticCatalog = (process.env.NOCTURNA_STATIC_CATALOG ?? (process.env.VERCEL ? '0' : '1')) !== '0';

async function catalogue() {
  if (!staticCatalog) {
    if (!process.env.DATABASE_URL) return null;
    const { publicStories } = await import('../api/_lib/store.mjs');
    return publicStories();
  }
  const { publicPlace, resolvePlace } = await import('../dist/maplink.js');
  const stories = JSON.parse(await readFile(new URL('../content/stories.json', import.meta.url), 'utf8').catch(() => '[]'));
  return stories.filter(story => story.status === 'published')
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '') || a.slug.localeCompare(b.slug))
    .map(story => ({ ...story, place: publicPlace(resolvePlace(story.slug, story.place)) }));
}

// A página inicial traz os dossiês recentes no HTML, visíveis para leitores e buscadores; app.js atualiza a lista
// com o catálogo atual ao abrir. Sem acesso ao catálogo, a lista fica só por conta de app.js.
let stories = null;
try {
  stories = await catalogue();
} catch (error) {
  console.warn(`Dossiês recentes não incluídos no HTML: ${error.message}`);
}
for (const lang of ['pt', 'en', 'es']) {
  const file = new URL(`../dist/${lang}/index.html`, import.meta.url);
  const page = await readFile(file, 'utf8');
  await writeFile(file, page.replace('<!--RECENT_STORIES-->', stories ? recentStoriesHtml(stories, lang) : ''));
}

// Localmente, a lista completa também é estática (na Vercel ela vem da função api/place.mjs).
if (staticCatalog && stories) {
  const { archivePage } = await import('../api/_lib/seo.mjs');
  for (const lang of ['pt', 'en', 'es']) {
    const folder = new URL(`../dist${sitePages.archive[lang]}`, import.meta.url);
    await mkdir(folder, { recursive: true });
    const html = archivePage(stories, lang).replace('<meta name="robots" content="index,follow,max-image-preview:large">', '<meta name="robots" content="noindex,follow">');
    await writeFile(new URL('index.html', folder), html);
  }
}
console.log(`Página inicial: ${stories ? Math.min(stories.length, RECENT_LIMIT) : 0} dossiês recentes no HTML`);
