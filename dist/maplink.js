// Localização pública das histórias.
// - Padrão: local exato. O link abre o Street View escolhido no painel ou o Google Maps no nome/endereço
//   público (mapQuery, ou a lista public-places.js) ou nas coordenadas.
// - Local sensível (caixa no painel, place.sensitive, ou a lista sensitive-places.js para dossiês antigos):
//   crimes, vítimas, residências. As coordenadas públicas são arredondadas (~1 km), Street View e endereço
//   não são publicados e a página mostra o aviso "Local aproximado".
// resolvePlace() calcula place.precision a partir dessas regras; o valor gravado antes disso é ignorado.
// Usado por app.js, story-page.js, api/_lib/store.mjs e api/_lib/seo.mjs; build_pages.py e server.mjs têm equivalentes.

import publicPlaces from './public-places.js';
import sensitiveSlugs from './sensitive-places.js';

export const isExact = place => place?.precision === 'exact';

export const isSensitive = (slug, place) => typeof place?.sensitive === 'boolean' ? place.sensitive : sensitiveSlugs.includes(slug);

export function resolvePlace(slug, place) {
  if (!place) return place;
  if (isSensitive(slug, place)) return { ...place, precision: 'approximate' };
  const mapQuery = place.mapQuery || publicPlaces[slug]?.mapQuery;
  return { ...place, precision: 'exact', ...(mapQuery ? { mapQuery } : {}) };
}

const round = value => Math.round(value * 100) / 100;

export function publicPlace(place) {
  if (!place || isExact(place)) return place;
  const { streetViewUrl, mapQuery, ...rest } = place;
  return { ...rest, latitude: round(place.latitude), longitude: round(place.longitude) };
}

// kind: 'streetView' | 'place' | 'region' (define o texto do link).
export function mapLink(place) {
  if (isExact(place)) {
    if (place.streetViewUrl) return { kind: 'streetView', href: place.streetViewUrl };
    const query = place.mapQuery?.trim() || `${place.latitude},${place.longitude}`;
    return { kind: 'place', href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` };
  }
  const { latitude, longitude } = publicPlace(place);
  return { kind: 'region', href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}` };
}

export const mapLabels = {
  pt: { streetView: 'Ver no Street View', place: 'Ver no Google Maps', region: 'Ver no Google Maps', approximate: 'Local aproximado' },
  en: { streetView: 'Open in Street View', place: 'Open in Google Maps', region: 'Open in Google Maps', approximate: 'Approximate location' },
  es: { streetView: 'Ver en Street View', place: 'Ver en Google Maps', region: 'Ver en Google Maps', approximate: 'Ubicación aproximada' },
};
