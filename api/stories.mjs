import { json } from './_lib/http.mjs';
import { publicStories } from './_lib/store.mjs';

export async function GET() {
  try {
    const stories = await publicStories();
    return json({ stories: stories.map(story => ({ slug: story.slug, classification: story.classification, place: story.place, translations: story.translations })) });
  } catch (error) {
    console.error(error);
    return json({ error: 'Catálogo temporariamente indisponível' }, 503);
  }
}
