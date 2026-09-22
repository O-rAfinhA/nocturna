import { clientKey } from '../_lib/auth.mjs';
import { failure, hash, input, json, newCsrf, newToken, passwordIsValid, sameOrigin, sessionCookie } from '../_lib/http.mjs';
import { createSession, takeRate } from '../_lib/store.mjs';

export async function POST(request) {
  try {
    if (!sameOrigin(request)) return failure('Origem inválida', 403);
    if (!await takeRate(`login:${clientKey(request)}`, 8, 900)) return failure('Tente novamente mais tarde', 429);
    const value = await input(request, 5_000);
    if (!passwordIsValid(value.password)) return failure('Senha inválida', 401);
    const token = newToken();
    const csrf = newCsrf();
    await createSession(hash(token), csrf);
    return json({ csrf }, 200, { 'Set-Cookie': sessionCookie(token) });
  } catch (error) {
    console.error(error);
    return failure(error.message === 'admin not configured' ? 'Administração ainda não configurada' : 'Não foi possível entrar', 503);
  }
}
