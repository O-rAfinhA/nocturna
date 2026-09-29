import assert from 'node:assert/strict';
import test from 'node:test';
import { mapLink, publicPlace } from '../dist/maplink.js';

const base = { city: 'São Paulo', region: 'SP', country: 'Brasil', latitude: -23.545531, longitude: -46.635219 };

test('approximate places are published rounded and without exact links', () => {
  const place = publicPlace({ ...base, streetViewUrl: 'https://maps.app.goo.gl/x', mapQuery: 'Rua X, 10' });
  assert.deepEqual(place, { ...base, latitude: -23.55, longitude: -46.64 });
  assert.deepEqual(mapLink(base), { kind: 'region', href: 'https://www.google.com/maps/search/?api=1&query=-23.55%2C-46.64' });
});

test('exact public places keep their data and link to the place', () => {
  const exact = { ...base, precision: 'exact', mapQuery: 'Edifício Martinelli, São Paulo' };
  assert.equal(publicPlace(exact), exact);
  assert.deepEqual(mapLink(exact), { kind: 'place', href: 'https://www.google.com/maps/search/?api=1&query=Edif%C3%ADcio%20Martinelli%2C%20S%C3%A3o%20Paulo' });
  assert.equal(mapLink({ ...exact, mapQuery: undefined }).href, 'https://www.google.com/maps/search/?api=1&query=-23.545531%2C-46.635219');
  assert.equal(mapLink({ ...exact, streetViewUrl: 'https://maps.app.goo.gl/x' }).kind, 'streetView');
});

test('known public places become exact automatically; sensitive ones stay rounded', async () => {
  const { resolvePlace } = await import('../dist/maplink.js');
  const crater = { city: 'Darvaza', region: 'Karakum', country: 'Turcomenistão', latitude: 40.2526, longitude: 58.4394 };
  assert.equal(mapLink(publicPlace(resolvePlace('cratera-darvaza-porta-do-inferno', crater))).href, 'https://www.google.com/maps/search/?api=1&query=Darvaza%20gas%20crater');
  assert.equal(mapLink(publicPlace(resolvePlace('evento-tunguska-explosao-siberia-1908', { ...crater, latitude: 60.886, longitude: 101.894 }))).href, 'https://www.google.com/maps/search/?api=1&query=60.886%2C101.894');
  assert.equal(mapLink(publicPlace(resolvePlace('massacre-de-suzano-2019', { ...crater, latitude: -23.5432, longitude: -46.3111 }))).kind, 'region');
});

test('exact is the default; approximate only when flagged or listed as sensitive', async () => {
  const { resolvePlace } = await import('../dist/maplink.js');
  const point = { city: 'C', region: 'R', country: 'P', latitude: -10.12345, longitude: -50.98765, precision: 'approximate' };
  assert.equal(resolvePlace('qualquer-dossie', point).precision, 'exact');
  assert.equal(resolvePlace('qualquer-dossie', { ...point, sensitive: true }).precision, 'approximate');
  assert.equal(resolvePlace('massacre-de-suzano-2019', point).precision, 'approximate');
  assert.equal(resolvePlace('massacre-de-suzano-2019', { ...point, sensitive: false }).precision, 'exact');
});
