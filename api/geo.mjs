import { json } from './_lib/http.mjs';

// País aproximado do visitante informado pela Vercel (a partir do IP). Só o código ISO é devolvido; nada é gravado.
export function GET(request) {
  const country = request.headers.get('x-vercel-ip-country') || '';
  return json({ country: /^[A-Z]{2}$/.test(country) ? country : null }, 200, { 'Cache-Control': 'private, no-store', Vary: 'X-Vercel-IP-Country' });
}
