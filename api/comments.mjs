import { failure, input, json, sameOrigin } from './_lib/http.mjs';
import { clientKey } from './_lib/auth.mjs';
import { addComment, approvedForStory, storyBySlug, takeRate } from './_lib/store.mjs';

export async function GET(request) {
  try {
    const slug = new URL(request.url).searchParams.get('story');
    if (!slug || !await storyBySlug(slug)) return failure('História indisponível', 404);
    return json({ comments: await approvedForStory(slug) });
  } catch (error) {
    console.error(error);
    return json({ error: 'Comentários temporariamente indisponíveis' }, 503);
  }
}

export async function POST(request) {
  try {
    if (!sameOrigin(request)) return failure('Origem inválida', 403);
    if (!await takeRate(`comment:${clientKey(request)}`, 5, 600)) return failure('Aguarde antes de comentar', 429);
    const value = await input(request);
    if (value.website) return json({ status: 'pending' }, 202);
    if (!await storyBySlug(value.story) || !['pt', 'en', 'es'].includes(value.lang) || typeof value.author !== 'string' || typeof value.body !== 'string' || value.author.trim().length < 2 || value.author.trim().length > 50 || value.body.trim().length < 3 || value.body.trim().length > 2000) return failure('Revise o comentário');
    await addComment({ slug: value.story, author: value.author.trim(), body: value.body.trim(), lang: value.lang });
    return json({ status: 'pending' }, 202);
  } catch (error) {
    console.error(error);
    return failure(error.message === 'too large' ? 'Comentário muito longo' : 'Não foi possível enviar o comentário', error.message === 'too large' ? 413 : 503);
  }
}
