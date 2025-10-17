// lib/routeEngine.ts

import { Venue } from "../types/venue";
import { isVenueOpenNow } from "../utils/timeUtils";
import { getDistanceMeters } from "../utils/geoUtils";

export interface RouteOptions {
  startTime?: Date;
  maxStops?: number;
  filterOpen?: boolean;
  prioritizeNearby?: boolean;
}

export function generateRoute(
  venues: Venue[],
  opts: RouteOptions = {}
): Venue[] {
  const {
    startTime = new Date(),
    maxStops = 5,
    filterOpen = true,
    prioritizeNearby = true,
  } = opts;

  let pool = filterOpen
    ? venues.filter((v) => isVenueOpenNow(v, startTime))
    : [...venues];

  if (pool.length === 0) return [];

  const route: Venue[] = [];
  let currentTime = startTime;

  // Pick a random or middle start point
  let current = pool[Math.floor(pool.length / 2)];
  route.push(current);
  pool = pool.filter((v) => v !== current);

  while (route.length < maxStops && pool.length > 0) {
    const scored = pool.map((v) => {
      const dist = getDistanceMeters(current.lat, current.lon, v.lat, v.lon);
      const duration = v.duration ?? 1.5;

      let score = 1 / (dist + 1);

      // Future: weight by tags, energyRamp, etc.
      return { venue: v, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const next = scored[0].venue;

    route.push(next);
    pool = pool.filter((v) => v !== next);
    current = next;

    const addedHours = next.duration ?? 1.5;
    currentTime = new Date(currentTime.getTime() + addedHours * 60 * 60 * 1000);
  }

  return route;
}
