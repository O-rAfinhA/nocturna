import { publicStories } from './_lib/store.mjs';
import { localitySlugFor, sitemap, storyPage } from './_lib/seo.mjs';
import { PUBLIC_CACHE } from './_lib/http.mjs';

export async function GET(request) {
  const params = new URL(request.url).searchParams;
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
