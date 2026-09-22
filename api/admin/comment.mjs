import { failure, input, json, sameOrigin } from '../_lib/http.mjs';
import { requireAdmin } from '../_lib/auth.mjs';
import { deleteComment, updateComment } from '../_lib/store.mjs';

function idFrom(request) {
  const value = Number(new URL(request.url).searchParams.get('id'));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

export async function PATCH(request) {
  try {
    const auth = await requireAdmin(request, true);
    if (auth.response) return auth.response;
    if (!sameOrigin(request)) return failure('Origem inválida', 403);
    const id = idFrom(request);
    const value = await input(request);
    if (!id || !['approved', 'rejected', 'pending'].includes(value.status)) return failure('Estado inválido');
    const changed = await updateComment(id, value.status);
    return json({ ok: changed }, changed ? 200 : 404);
  } catch (error) {
    console.error(error);
    return json({ error: 'Não foi possível atualizar o comentário' }, 503);
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAdmin(request, true);
    if (auth.response) return auth.response;
    if (!sameOrigin(request)) return failure('Origem inválida', 403);
    const id = idFrom(request);
    if (!id) return failure('Comentário inválido');
    const changed = await deleteComment(id);
    return json({ ok: changed }, changed ? 200 : 404);
  } catch (error) {
    console.error(error);
    return json({ error: 'Não foi possível excluir o comentário' }, 503);
  }
}
