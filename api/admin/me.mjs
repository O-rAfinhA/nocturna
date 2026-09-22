import { json } from '../_lib/http.mjs';
import { requireAdmin } from '../_lib/auth.mjs';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    return auth.response || json({ csrf: auth.session.csrf });
  } catch (error) {
    console.error(error);
    return json({ error: 'Administração temporariamente indisponível' }, 503);
  }
}
