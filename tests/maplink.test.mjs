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
