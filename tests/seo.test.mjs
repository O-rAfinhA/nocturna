import assert from 'node:assert/strict';
import test from 'node:test';
import { groupPlaces, localitySlugFor, nearbyStories, placePage, placeUrl, sitemap, storyPage, storyUrl } from '../api/_lib/seo.mjs';

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
    assert.match(html, /<h1 id="story-title">Título [a-z]{2} &lt;teste&gt;<\/h1>/);
    assert.match(html, /<p>Segundo parágrafo com &lt;script&gt;\.<\/p>/);
    assert.ok(html.includes(`<link rel="canonical" href="${storyUrl(lang, story.slug)}">`));
    assert.match(html, /hreflang="pt-BR"/);
    assert.match(html, /hreflang="en"/);
    assert.match(html, /hreflang="es"/);
    assert.match(html, /"@type":"Article"/);
    assert.ok(!html.includes('Segundo parágrafo com <script>.'));
    assert.ok(html.includes('<script defer src="/privacy.js" data-analytics="vercel"></script>'));
    assert.ok(!html.includes('/_vercel/insights/script.js'));
    assert.match(html, new RegExp(`<option value="/${lang}/(historias|stories)/historia-exemplo/" selected>${lang.toUpperCase()}</option>`));
    assert.equal((html.match(/<option /g) || []).length, 3);
    assert.ok(!html.includes('article-languages'));
    assert.ok(html.includes('<script type="module" src="/story-reader.js"></script>'));
    assert.ok(html.includes(`<div id="story-reader" class="story-reader" data-lang="${lang}" hidden></div>`));
    assert.match(html, /<h1 id="story-title">/);
    assert.match(html, /<p id="story-summary">/);
    assert.match(html, /<div id="story-reading-text"><p>Primeiro parágrafo\.<\/p><p>Segundo parágrafo com &lt;script&gt;\.<\/p><\/div>/);
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
  const located = { ...story, place: { ...story.place, latitude: -25.4321, longitude: -49.2765 } };
  const html = storyPage(located, 'pt');
  // Local aproximado: alfinete no ponto arredondado (~1 km).
  const link = html.indexOf('https://www.google.com/maps/search/?api=1&amp;query=-25.43%2C-49.28');
  assert.ok(link > html.indexOf('Segundo parágrafo') && link < html.indexOf('id="sources-heading"'));
  assert.match(html, />Ver no Google Maps<\/a> <span class="location-note">· Local aproximado<\/span>/);
  // Street View cadastrado num local aproximado não é publicado.
  assert.ok(!storyPage({ ...located, place: { ...located.place, streetViewUrl: 'https://www.google.com/maps/@-25.4,-49.2,3a' } }, 'pt').includes('3a'));
  const exact = { ...located, place: { ...located.place, precision: 'exact', mapQuery: 'Edifício Martinelli, São Paulo' } };
  assert.match(storyPage(exact, 'es'), /<a href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=Edif%C3%ADcio%20Martinelli%2C%20S%C3%A3o%20Paulo" target="_blank" rel="noopener noreferrer">Ver en Google Maps<\/a><\/p>/);
  const street = storyPage({ ...exact, place: { ...exact.place, streetViewUrl: 'https://www.google.com/maps/@-25.4,-49.2,3a,75y,90h' } }, 'en');
  assert.match(street, /<a href="https:\/\/www\.google\.com\/maps\/@-25\.4,-49\.2,3a,75y,90h" target="_blank" rel="noopener noreferrer">Open in Street View<\/a><\/p>/);
});

test('place pages also list nearby stories, closest first', () => {
  const at = (slug, city, latitude, longitude) => ({ ...story, slug, place: { city, region: 'R', country: 'Brasil', latitude, longitude } });
  const curitiba = at('curitiba', 'Curitiba', -25.43, -49.27);
  const all = [curitiba, at('guaratuba', 'Guaratuba', -25.88, -48.58), at('sao-paulo', 'São Paulo', -23.55, -46.63), at('colares', 'Colares', -0.94, -48.28), at('varginha', 'Varginha', -21.55, -45.43)];
  const group = groupPlaces(all).find(item => item.stories.includes(curitiba));
  // Só Guaratuba fica a menos de 300 km; completa com as mais próximas até 3.
  assert.deepEqual(nearbyStories(group, all).map(item => item.story.slug), ['guaratuba', 'sao-paulo', 'varginha']);
  const html = placePage(group, 'pt', all);
  assert.ok(html.indexOf('>Neste lugar<') < html.indexOf('>Histórias próximas<'));
  assert.match(html, /<p class="eyebrow">\d+ km · Guaratuba<\/p>/);
  assert.ok(!html.includes('/colares/'));
  const near = [curitiba, ...Array.from({ length: 5 }, (_, i) => at(`perto-${i}`, 'Perto', -25.43 + i * 0.1, -49.27))];
  assert.equal(nearbyStories(groupPlaces(near).find(item => item.stories.includes(curitiba)), [...near, ...all.slice(1)]).length, 6);
});
