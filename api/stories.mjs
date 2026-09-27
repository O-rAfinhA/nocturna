import { SHORT_PUBLIC_CACHE, json } from './_lib/http.mjs';
import { publicStories } from './_lib/store.mjs';

export async function GET() {
  try {
    const stories = await publicStories();
    return json({ stories: stories.map(story => ({ slug: story.slug, classification: story.classification, place: story.place, translations: Object.fromEntries(Object.entries(story.translations).map(([lang, copy]) => [lang, { title: copy.title, summary: copy.summary }])) })) }, 200, { 'Cache-Control': SHORT_PUBLIC_CACHE });
  } catch (error) {
    console.error(error);
    return json({ error: 'Catálogo temporariamente indisponível' }, 503);
  }
}
