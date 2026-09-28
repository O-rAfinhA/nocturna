import { STORY_BYTES, failure, input, json, sameOrigin, storyProblem } from '../_lib/http.mjs';
import { requireAdmin } from '../_lib/auth.mjs';
import { allStories, deleteStory, saveStory } from '../_lib/store.mjs';

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
    const story = await input(request, STORY_BYTES);
    const problem = storyProblem(story);
    if (problem) return failure(problem);
    await saveStory(story);
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return failure(error.message === 'too large' ? 'História muito longa' : 'Não foi possível salvar a história', error.message === 'too large' ? 413 : 503);
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAdmin(request, true);
    if (auth.response) return auth.response;
    if (!sameOrigin(request)) return failure('Origem inválida', 403);
    const slug = new URL(request.url).searchParams.get('slug') || '';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return failure('História inválida');
    const removed = await deleteStory(slug);
    return removed ? json({ ok: true }) : failure('História não encontrada', 404);
  } catch (error) {
    console.error(error);
    return failure('Não foi possível excluir a história', 503);
  }
}
