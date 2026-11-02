import { publicStories } from './_lib/store.mjs';
import { archivePage, archivePath, groupPlaces, placePage } from './_lib/seo.mjs';
import { PUBLIC_CACHE } from './_lib/http.mjs';

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const lang = params.get('lang');
  const slug = params.get('slug');
  // Lista completa dos dossiês (/pt/historias/, /en/stories/, /es/historias/, por rewrite). Fica nesta função
  // porque o plano da Vercel limita o número de Functions.
  if (params.get('type') === 'archive' && ['pt', 'en', 'es'].includes(lang)) {
    // Paginação por ?p=2, ?p=3...; ?p=1 redireciona para o endereço sem número, para não duplicar a primeira página.
    const raw = params.get('p');
    if (raw === '1') return new Response(null, { status: 308, headers: { Location: archivePath(lang), 'Cache-Control': PUBLIC_CACHE } });
    const missing = new Response('Página indisponível', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
    if (raw !== null && !/^[1-9]\d{0,3}$/.test(raw)) return missing;
    try {
      const html = archivePage(await publicStories(), lang, raw === null ? 1 : Number(raw));
      if (!html) return missing;
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': PUBLIC_CACHE } });
    } catch (error) {
      console.error(error);
      return new Response('Lista temporariamente indisponível', { status: 503, headers: { 'X-Robots-Tag': 'noindex' } });
    }
  }
  if (!['pt', 'en', 'es'].includes(lang) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) return new Response('Local indisponível', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
  try {
    const stories = await publicStories();
    const group = groupPlaces(stories).find(place => place.slug === slug);
    if (!group) return new Response('Local indisponível', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
    return new Response(placePage(group, lang, stories), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': PUBLIC_CACHE } });
  } catch (error) {
    console.error(error);
    return new Response('Local temporariamente indisponível', { status: 503, headers: { 'X-Robots-Tag': 'noindex' } });
  }
}
