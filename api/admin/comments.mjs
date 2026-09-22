import { json } from '../_lib/http.mjs';
import { requireAdmin } from '../_lib/auth.mjs';
import { allComments } from '../_lib/store.mjs';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;
    return json({ comments: await allComments() });
  } catch (error) {
    console.error(error);
    return json({ error: 'Comentários temporariamente indisponíveis' }, 503);
  }
}
