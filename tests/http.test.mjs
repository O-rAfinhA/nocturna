import assert from 'node:assert/strict';
import test from 'node:test';
import { STORY_BYTES, input, storyProblem, validStory, validStreetViewUrl } from '../api/_lib/http.mjs';

const longStory = {
  slug: 'historia-longa', status: 'draft', classification: 'fiction',
  publishedAt: '2026-01-01', updatedAt: '2026-01-01',
  place: { city: 'Cidade', region: 'Região', country: 'Brasil', latitude: 0, longitude: 0 },
  sources: [],
  translations: Object.fromEntries(['pt', 'en', 'es'].map(lang => [lang, { title: 'Título', summary: 'Resumo', body: 'ã'.repeat(59_999) }])),
};

const request = value => new Request('https://portalnocturna.com.br/api/admin/stories', { method: 'POST', body: JSON.stringify(value) });

test('a story at the maximum length per language fits the request limit', async () => {
  assert.ok(validStory(longStory));
  assert.deepEqual(await input(request(longStory), STORY_BYTES), longStory);
});

test('the default limit counts bytes, not characters', async () => {
  await assert.rejects(input(request({ body: 'ã'.repeat(20_000) })), /too large/);
});

test('location precision is optional and limited to exact or approximate', () => {
  for (const precision of [undefined, 'exact', 'approximate']) assert.ok(validStory({ ...longStory, place: { ...longStory.place, precision } }));
  assert.ok(!validStory({ ...longStory, place: { ...longStory.place, precision: 'street' } }));
});

test('Street View links must point to Google Maps over HTTPS', () => {
  for (const url of [
    'https://www.google.com/maps/@-25.4288,-49.2733,3a,75y,90h,90t/data=!3m6!1e1',
    'https://maps.app.goo.gl/AbCdEf123',
    'https://goo.gl/maps/AbCdEf123',
    'https://www.google.com.br/maps/@-23.53,-46.65,3a,75y,90h/data=!3m6',
    'https://www.google.es/maps/place/Madrid',
    'https://maps.google.co.uk/maps?q=x',
  ]) assert.ok(validStreetViewUrl(url), url);
  for (const url of ['http://www.google.com/maps/@1,2', 'https://www.google.com/search?q=x', 'https://evil.example/maps', 'https://google.evil.com/maps', 'https://www.google.com.br.evil.io/maps', 'javascript:alert(1)', 42]) assert.ok(!validStreetViewUrl(url), String(url));
  assert.ok(validStory({ ...longStory, place: { ...longStory.place, streetViewUrl: 'https://maps.app.goo.gl/AbCdEf123' } }));
  assert.ok(!validStory({ ...longStory, place: { ...longStory.place, streetViewUrl: 'https://evil.example/maps' } }));
});

test('storyProblem explains what is wrong', () => {
  assert.equal(storyProblem(longStory), null);
  assert.match(storyProblem({ ...longStory, translations: { ...longStory.translations, en: { ...longStory.translations.en, title: '' } } }), /Título da aba English/);
  assert.match(storyProblem({ ...longStory, place: { ...longStory.place, streetViewUrl: 'https://example.org' } }), /Street View/);
  assert.match(storyProblem({ ...longStory, translations: { ...longStory.translations, es: { ...longStory.translations.es, body: 'x'.repeat(60_001) } } }), /Texto da aba Español tem 60\.001 caracteres/);
  assert.equal(storyProblem({ ...longStory, translations: { ...longStory.translations, pt: { ...longStory.translations.pt, body: 'ã'.repeat(60_000) } } }), null);
});

test('story texts with em or en dashes are rejected with a clear message', () => {
  const withDash = { ...longStory, translations: { ...longStory.translations, en: { ...longStory.translations.en, summary: 'The record says — and does not.' } } };
  assert.match(storyProblem(withDash), /Resumo da aba English tem travessão/);
  const withRange = { ...longStory, translations: { ...longStory.translations, pt: { ...longStory.translations.pt, body: 'Entre 1987–1988.' } } };
  assert.match(storyProblem(withRange), /Texto da aba Português tem travessão/);
  assert.equal(storyProblem({ ...longStory, sources: [{ title: 'Elizabeth Báthory – Between Legend and Reality', url: 'https://example.org' }] }), null);
});
