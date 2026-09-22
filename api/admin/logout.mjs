import { hash, json, sessionCookie, sessionToken } from '../_lib/http.mjs';
import { requireAdmin } from '../_lib/auth.mjs';
import { removeSession } from '../_lib/store.mjs';

export async function POST(request) {
  try {
    const auth = await requireAdmin(request, true);
    if (auth.response) return auth.response;
    await removeSession(hash(sessionToken(request) || ''));
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });
  } catch (error) {
    console.error(error);
    return json({ error: 'Não foi possível sair' }, 503);
  }
}
