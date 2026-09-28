import assert from 'node:assert/strict';
import test from 'node:test';
import { STORY_BYTES, input, validStory } from '../api/_lib/http.mjs';

const longStory = {
  slug: 'historia-longa', status: 'draft', classification: 'fiction',
  publishedAt: '2026-01-01', updatedAt: '2026-01-01',
  place: { city: 'Cidade', region: 'Região', country: 'Brasil', latitude: 0, longitude: 0 },
  sources: [],
  translations: Object.fromEntries(['pt', 'en', 'es'].map(lang => [lang, { title: 'Título', summary: 'Resumo', body: 'ã'.repeat(14_999) }])),
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
