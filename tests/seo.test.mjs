import assert from 'node:assert/strict';
import test from 'node:test';
import { groupPlaces, localitySlugFor, placePage, placeUrl, sitemap, storyPage, storyUrl } from '../api/_lib/seo.mjs';

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
    assert.ok(html.includes('<script defer src="/privacy.js" data-analytics="vercel"></script>'));
    assert.ok(!html.includes('/_vercel/insights/script.js'));
  });
}

test('sitemap contains only supplied published stories and their translations', () => {
  const xml = sitemap([story]);
  assert.equal((xml.match(/<url>/g) || []).length, 12);
  assert.ok(xml.includes('/pt/privacidade.html'));
  assert.ok(xml.includes('/en/privacidade.html'));
  assert.ok(xml.includes('/es/privacidade.html'));
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

test('places without Latin letters still get a stable URL slug', () => {
  const tokyo = { ...story, slug: 'historia-toquio', place: { city: '東京', region: '東京都', country: '日本' } };
  const [group] = groupPlaces([tokyo]);
  assert.match(group.slug, /^lugar-[a-f0-9]{10}$/);
  assert.equal(groupPlaces([tokyo])[0].slug, group.slug);
});

test('story pages link to the de-duplicated slug of their own place', () => {
  const first = { ...story, slug: 'primeira', place: { city: 'São Paulo', region: 'SP', country: 'Brasil' } };
  const second = { ...story, slug: 'segunda', place: { city: 'Sao Paulo', region: 'SP', country: 'Brasil' } };
  const groups = groupPlaces([first, second]);
  assert.deepEqual(groups.map(group => group.slug).sort(), ['sao-paulo-sp-brasil', 'sao-paulo-sp-brasil-2']);
  for (const item of [first, second]) {
    const expected = groups.find(group => group.stories.includes(item)).slug;
    assert.equal(localitySlugFor(item, [first, second]), expected);
    assert.ok(storyPage(item, 'pt', localitySlugFor(item, [first, second])).includes(placeUrl('pt', expected)));
  }
});

test('story pages link to the map between the article and the sources', () => {
  const located = { ...story, place: { ...story.place, latitude: -25.4, longitude: -49.2 } };
  const html = storyPage(located, 'pt');
  const link = html.indexOf('https://www.google.com/maps/search/?api=1&amp;query=-25.4,-49.2');
  assert.ok(link > html.indexOf('Segundo parágrafo') && link < html.indexOf('id="sources-heading"'));
  assert.match(html, />Ver no Google Maps<\/a> <span class="location-note">· Local aproximado<\/span>/);
  const street = storyPage({ ...located, place: { ...located.place, precision: 'exact', streetViewUrl: 'https://www.google.com/maps/@-25.4,-49.2,3a,75y,90h' } }, 'en');
  assert.match(street, /<a href="https:\/\/www\.google\.com\/maps\/@-25\.4,-49\.2,3a,75y,90h" target="_blank" rel="noopener noreferrer">Open in Street View<\/a><\/p>/);
});
