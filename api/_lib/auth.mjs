import { failure, hash, sessionToken } from './http.mjs';
import { getSession } from './store.mjs';

export async function requireAdmin(request, csrf = false) {
  const session = await getSession(hash(sessionToken(request) || ''));
  if (!session) return { response: failure('Acesso restrito', 401) };
  if (csrf && request.headers.get('x-csrf-token') !== session.csrf) return { response: failure('Solicitação inválida', 403) };
  return { session };
}

export const clientKey = request => request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
