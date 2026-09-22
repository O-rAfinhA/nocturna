import { failure, input, json, sameOrigin, validStory } from '../_lib/http.mjs';
import { requireAdmin } from '../_lib/auth.mjs';
import { allStories, saveStory } from '../_lib/store.mjs';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;
    return json({ stories: await allStories() });
  } catch (error) {
    console.error(error);
    return json({ error: 'Catálogo temporariamente indisponível' }, 503);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request, true);
    if (auth.response) return auth.response;
    if (!sameOrigin(request)) return failure('Origem inválida', 403);
    const story = await input(request);
    if (!validStory(story)) return failure('Revise os campos da história');
    await saveStory(story);
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return failure(error.message === 'too large' ? 'História muito longa' : 'Não foi possível salvar a história', error.message === 'too large' ? 413 : 503);
  }
}
