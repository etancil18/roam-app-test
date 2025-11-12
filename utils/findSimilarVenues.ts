// utils/findSimilarVenues.ts
import type { Venue } from "@/types/venue";

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371; // Earth radius in km
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLon = (b.lon - a.lon) * (Math.PI / 180);
  const lat1 = a.lat * (Math.PI / 180);
  const lat2 = b.lat * (Math.PI / 180);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function getParsedVibes(v: Venue): string[] {
  if (Array.isArray((v as any).vibes)) return (v as any).vibes;
  if (typeof v.vibe === 'string') {
    return v.vibe.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

export function findSimilarVenuesNearby(
  allVenues: Venue[],
  target: Venue,
  max = 3,
  maxDistanceKm = 1
): Venue[] {
  const targetVibes = getParsedVibes(target);
  if (targetVibes.length === 0) return [];

  return allVenues
    .filter(v => v.id !== target.id && Number.isFinite(v.lat) && Number.isFinite(v.lon))
    .map(v => {
      const venueVibes = getParsedVibes(v);
      const sharedVibes = venueVibes.filter(vibe => targetVibes.includes(vibe));
      const distance = haversine(target, v);
      return {
        ...v,
        similarityScore: sharedVibes.length,
        sharedVibes,
        distance,
      };
    })
    .filter(v => v.similarityScore > 0 && v.distance <= maxDistanceKm)
    .sort((a, b) => {
      if (b.similarityScore !== a.similarityScore) {
        return b.similarityScore - a.similarityScore;
      }
      return a.distance - b.distance;
    })
    .slice(0, max);
}
