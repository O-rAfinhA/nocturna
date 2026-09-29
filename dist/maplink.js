// Localização pública das histórias.
// - Local exato (place.precision === "exact"): lugares e endereços públicos. O link abre o Street View escolhido
//   no painel ou o Google Maps no nome/endereço público (mapQuery) ou nas coordenadas.
// - Local aproximado (padrão): locais indefinidos ou sensíveis. As coordenadas públicas são arredondadas
//   (~1 km) e o link abre o Google Maps com o alfinete nesse ponto arredondado; Street View e endereço não
//   são publicados.
// Usado por app.js, story-page.js e api/_lib/seo.mjs; build_pages.py e server.mjs têm equivalentes.

export const isExact = place => place?.precision === 'exact';

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
  pt: { streetView: 'Ver no Street View', place: 'Ver no Google Maps', region: 'Ver no Google Maps' },
  en: { streetView: 'Open in Street View', place: 'Open in Google Maps', region: 'Open in Google Maps' },
  es: { streetView: 'Ver en Street View', place: 'Ver en Google Maps', region: 'Ver en Google Maps' },
};
