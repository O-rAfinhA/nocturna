import { publicStories } from './_lib/store.mjs';
import { localitySlugFor, placeUrl, sitemap, storyPage, storyUrl } from './_lib/seo.mjs';
import { PUBLIC_CACHE } from './_lib/http.mjs';

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  // /api/geo (rewrite): país aproximado informado pela Vercel a partir do IP. Fica nesta função porque o plano
  // da Vercel limita o número de Functions. Só o código ISO é devolvido; nada é gravado.
  if (params.get('type') === 'geo') {
    const country = request.headers.get('x-vercel-ip-country') || '';
    return new Response(JSON.stringify({ country: /^[A-Z]{2}$/.test(country) ? country : null }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' } });
  }
  // Endereços alternativos (rewrites): dossiê ou lugar sem a barra final e o antigo story.html?lang=&slug=.
  // Redirecionam de forma permanente para o endereço canônico, evitando 404 e páginas duplicadas no Google.
  if (params.get('type') === 'canonical') {
    const lang = ['pt', 'en', 'es'].includes(params.get('lang')) ? params.get('lang') : 'pt';
    const slug = params.get('slug') || '';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return new Response('Página indisponível', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
    const location = params.get('kind') === 'place' ? placeUrl(lang, slug) : storyUrl(lang, slug);
    return new Response(null, { status: 308, headers: { Location: location, 'Cache-Control': PUBLIC_CACHE } });
  }
  if (params.get('type') === 'sitemap') {
    try {
      return new Response(sitemap(await publicStories()), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': PUBLIC_CACHE } });
    } catch (error) {
      console.error(error);
      return new Response('Sitemap indisponível', { status: 503, headers: { 'X-Robots-Tag': 'noindex' } });
    }
  }
  const lang = params.get('lang');
  const slug = params.get('slug');
  if (!['pt', 'en', 'es'].includes(lang) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) {
    return new Response('História indisponível', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
  }
  try {
    const stories = await publicStories();
    const story = stories.find(item => item.slug === slug);
    if (!story) return new Response('História indisponível', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
    return new Response(storyPage(story, lang, localitySlugFor(story, stories)), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': PUBLIC_CACHE } });
  } catch (error) {
    console.error(error);
    return new Response('História temporariamente indisponível', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
  }
}
