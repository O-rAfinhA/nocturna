import { failure, json } from './_lib/http.mjs';
import { storyBySlug } from './_lib/store.mjs';

export async function GET(request) {
  try {
    const slug = new URL(request.url).searchParams.get('slug');
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return failure('História indisponível', 404);
    const story = await storyBySlug(slug);
    return story ? json({ story }) : failure('História indisponível', 404);
  } catch (error) {
    console.error(error);
    return json({ error: 'História temporariamente indisponível' }, 503);
  }
}
