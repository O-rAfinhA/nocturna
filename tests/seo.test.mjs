import assert from 'node:assert/strict';
import test from 'node:test';
import { groupPlaces, placePage, placeUrl, sitemap, storyPage, storyUrl } from '../api/_lib/seo.mjs';

const story = {
  slug: 'historia-exemplo', status: 'published', classification: 'documented',
  publishedAt: '2026-01-01', updatedAt: '2026-02-01',
  place: { city: 'Cidade', region: 'Região', country: 'Brasil' },
  translations: Object.fromEntries(['pt', 'en', 'es'].map(lang => [lang, {
    title: `Título ${lang} <teste>`, summary: `Resumo ${lang} & contexto`,
    body: 'Primeiro parágrafo.\n\nSegundo parágrafo com <script>.',
  }])),
  sources: [{ title: 'Arquivo', url: 'https://example.org/documento' }],
  explore: [{ kind: 'video', url: 'https://example.org/video', labels: { pt: 'Vídeo', en: 'Video', es: 'Vídeo' } }],
};

for (const lang of ['pt', 'en', 'es']) {
  test(`article HTML includes readable content and ${lang} search metadata`, () => {
    const html = storyPage(story, lang);
    assert.match(html, /<h1>Título [a-z]{2} &lt;teste&gt;<\/h1>/);
    assert.match(html, /<p>Segundo parágrafo com &lt;script&gt;\.<\/p>/);
    assert.ok(html.includes(`<link rel="canonical" href="${storyUrl(lang, story.slug)}">`));
    assert.match(html, /hreflang="pt-BR"/);
    assert.match(html, /hreflang="en"/);
    assert.match(html, /hreflang="es"/);
    assert.match(html, /"@type":"Article"/);
    assert.ok(!html.includes('Segundo parágrafo com <script>.'));
    assert.ok(html.includes('/_vercel/insights/script.js'));
  });
}

test('sitemap contains only supplied published stories and their translations', () => {
  const xml = sitemap([story]);
  assert.equal((xml.match(/<url>/g) || []).length, 9);
  assert.ok(xml.includes(storyUrl('pt', story.slug)));
  assert.ok(xml.includes(storyUrl('en', story.slug)));
  assert.ok(xml.includes(storyUrl('es', story.slug)));
  assert.ok(xml.includes('<lastmod>2026-02-01</lastmod>'));
});

test('place pages list only stories from that place', () => {
  const group = groupPlaces([story])[0];
  assert.equal(group.slug, 'cidade-regiao-brasil');
  const html = placePage(group, 'pt');
  assert.ok(html.includes(`<link rel="canonical" href="${placeUrl('pt', group.slug)}">`));
  assert.ok(html.includes(storyUrl('pt', story.slug)));
  assert.match(html, /<h1>Histórias de Cidade, Região, Brasil<\/h1>/);
});
