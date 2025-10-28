// lib/routeEngine.ts

import type { Venue } from "@/types/venue";
import { _intervalsForDate, daypartAllowedForNow } from "@/utils/timeUtils";
import { vibeSimilarity } from "@/utils/vibeUtils";
import { hasType, isMealType } from "@/utils/typeUtils";
import { sequencedStagesForNow } from "@/utils/stageUtils";
import { getDistanceMeters } from "@/utils/geoUtils";

export interface RouteOptions {
  startTime?: Date;
  maxStops?: number;
  filterOpen?: boolean;
  customStart?: { lat: number; lon: number };
  latestEndHour?: number;
  minVibeSimilarity?: number;
  maxDistMeal?: number;
  maxDistOther?: number;
  theme?: string;
}

const DEFAULTS = {
  maxStops: 6,
  durationPerStopHours: 1, // in hours
  bufferHours: 1,
  maxDistMealDefault: 2500,
  maxDistOtherDefault: 1000,
};

export async function generateRoute(
  venues: Venue[],
  userLat: number,
  userLon: number,
  opts: RouteOptions = {}
): Promise<Venue[]> {
  const {
    startTime = new Date(),
    maxStops = DEFAULTS.maxStops,
    filterOpen = true,
    customStart,
    latestEndHour,
    minVibeSimilarity = 0,
    maxDistMeal = DEFAULTS.maxDistMealDefault,
    maxDistOther = DEFAULTS.maxDistOtherDefault,
    theme,
  } = opts;

  const originLat = customStart?.lat ?? userLat;
  const originLon = customStart?.lon ?? userLon;

  const pool = venues.filter((v) => typeof v.lat === "number" && typeof v.lon === "number");
  if (pool.length === 0) {
    console.warn("generateRoute: no venues with valid lat/lon", venues.length);
    return [];
  }

  const stagePlan = sequencedStagesForNow(startTime, {
    durationHours: maxStops,
    latestEndHour,
    theme,
  });

  const route: Venue[] = [];
  let currentTime = new Date(startTime);
  let lastLat = originLat;
  let lastLon = originLon;
  let lastVenue: Venue | null = null;

  const today = startTime.getDay();
  const endHour = latestEndHour ?? (today >= 4 && today <= 6 ? 27 : 24); // Thu‑Sat night
  const latestEndTime = new Date(startTime);
  latestEndTime.setHours(endHour, 0, 0, 0);

  for (let i = 0; i < stagePlan.length && route.length < maxStops; i++) {
    const desiredTypes = stagePlan[i];
    const arrival = new Date(currentTime.getTime() + DEFAULTS.bufferHours * 3600 * 1000);
    if (arrival > latestEndTime) break;

    const candidates = pool
      .map((v) => {
        if (route.includes(v)) return null;
        if (!hasType(v, desiredTypes)) return null;

        const dist = getDistanceMeters(lastLat, lastLon, v.lat, v.lon);
        const maxDist = isMealType(v) ? maxDistMeal : maxDistOther;
        if (dist > maxDist) return null;

        if (filterOpen && !_isOpenAt(v, arrival)) return null;
        if (!daypartAllowedForNow(v, arrival)) return null;

if (typeof vibeSimilarity !== "function") {
  console.error("❌ vibeSimilarity is not a function!", {
    importedValue: vibeSimilarity,
    type: typeof vibeSimilarity,
  });
}
        const similarity = lastVenue ? vibeSimilarity(lastVenue, v) : 1;
        if (lastVenue && similarity < minVibeSimilarity) return null;

        // Attach a computed score (via type assertion)
        (v as any).__score = similarity * 1000 - dist;
        return v;
      })
      .filter(Boolean) as Venue[];

    if (candidates.length === 0) {
      // Could log for diagnostics
      // console.trace(`No candidates found for stage ${i}`, desiredTypes);
      continue;
    }

    candidates.sort((a, b) => (b as any).__score - (a as any).__score);
    const next = candidates[0];

    const estDuration = next.duration ?? DEFAULTS.durationPerStopHours;
    const estimatedEnd = new Date(currentTime.getTime() + estDuration * 3600 * 1000);
    if (estimatedEnd > latestEndTime) break;

    route.push(next);
    lastLat = next.lat;
    lastLon = next.lon;
    lastVenue = next;
    currentTime = estimatedEnd;
  }

  return route;
}

function _isOpenAt(venue: Venue, when: Date): boolean {
  const intervals = _intervalsForDate(when, venue.hoursNumeric || {});
  return intervals.some(([openTs, closeTs]) => when >= openTs && when < closeTs);
}
