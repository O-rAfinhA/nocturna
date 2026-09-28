import { publicStories } from './_lib/store.mjs';
import { groupPlaces, placePage } from './_lib/seo.mjs';
import { PUBLIC_CACHE } from './_lib/http.mjs';

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const lang = params.get('lang');
  const slug = params.get('slug');
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
