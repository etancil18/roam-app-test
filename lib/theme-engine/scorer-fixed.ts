import type { Venue } from "@/types/venue";
import type { CrawlTheme } from "@/lib/theme-engine/types";
import { getDistanceMeters } from "@/utils/geoUtils";
import { vibeSimilarity } from "@/utils/vibeUtils";
import { hasVibeOrTagMatch } from "@/utils/typeUtils";

export function computeScore(
  venue: Venue,
  theme: CrawlTheme,
  origin: { lat: number; lon: number },
  lastVenue: Venue | null,
  weight?: {
    vibe?: number;
    tag?: number;
    keyword?: number;
    dist?: number;
  }
): number {
  const {
    vibe = 1,
    tag = 1,
    keyword = 2,
    dist = 1,
  } = weight || {};

  const distMeters = getDistanceMeters(origin.lat, origin.lon, venue.lat, venue.lon);
  const vibeScore = lastVenue ? vibeSimilarity(lastVenue, venue) * vibe : 1;
  const keywordMatch = hasVibeOrTagMatch(venue, theme.keywords) ? keyword : 0;

  const score = vibeScore + keywordMatch - distMeters / 1000 * dist;
  return score;
}

export function sortVenuesByScore(
  venues: Venue[],
  theme: CrawlTheme,
  origin: { lat: number; lon: number },
  lastVenue: Venue | null
): Venue[] {
  return venues
    .map((v) => ({ ...v, _score: computeScore(v, theme, origin, lastVenue) }))
    .sort((a, b) => (b._score || 0) - (a._score || 0));
}