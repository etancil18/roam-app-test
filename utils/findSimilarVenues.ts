import type { Venue } from '@/types/venue';

interface VenueWithMeta extends Venue {
  similarityScore: number;
  sharedVibes: string[];
  sharedTypes: string[];
  distanceKm: number;
}

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = (Number(b.lat) - Number(a.lat)) * (Math.PI / 180);
  const dLon = (Number(b.lon) - Number(a.lon)) * (Math.PI / 180);
  const lat1 = Number(a.lat) * (Math.PI / 180);
  const lat2 = Number(b.lat) * (Math.PI / 180);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function parseVibes(v: Venue): string[] {
  if (typeof v.vibe === 'string') {
    return v.vibe.split(',').map(s => s.trim().toLowerCase());
  }
  return [];
}

function parseTypes(v: Venue): string[] {
  if (Array.isArray(v.type)) {
    return v.type.map(t => t.toLowerCase().trim());
  } else if (typeof v.type === 'string') {
    return [v.type.toLowerCase().trim()];
  }
  return [];
}

export function findSimilarVenuesNearby(
  allVenues: Venue[],
  target: Venue,
  max = 3,
  maxDistanceKm = 3
): Venue[] {
  const targetVibes = parseVibes(target);
  const targetTypes = parseTypes(target);
  const targetPrice = target.price;

  const results: VenueWithMeta[] = allVenues
    .filter(v => v.slug !== target.slug && Number.isFinite(Number(v.lat)) && Number.isFinite(Number(v.lon)))
    .map(v => {
      const vibes = parseVibes(v);
      const types = parseTypes(v);
      const sharedVibes = vibes.filter(vibe => targetVibes.includes(vibe));
      const sharedTypes = types.filter(type => targetTypes.includes(type));
      const priceMatch = v.price === targetPrice ? 1 : 0;
      const distanceKm = haversine(target, v);

      let similarityScore = 0;

      if (sharedVibes.length > 0 && sharedTypes.length > 0) {
        similarityScore += sharedVibes.length * 1.5 + sharedTypes.length * 1.5;
      } else if (sharedVibes.length > 0 || sharedTypes.length > 0) {
        similarityScore += sharedVibes.length + sharedTypes.length;
      } else if (priceMatch) {
        similarityScore += 0.5;
      }

      return {
        ...v,
        similarityScore,
        sharedVibes,
        sharedTypes,
        distanceKm,
      };
    })
    .filter(v => v.distanceKm <= maxDistanceKm && v.similarityScore > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore || a.distanceKm - b.distanceKm)
    .slice(0, max);

  return results;
}
