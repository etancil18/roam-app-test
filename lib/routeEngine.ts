// lib/routeEngine.ts

import { Venue } from "../types/venue";
import { isVenueOpenNow } from "../utils/timeUtils";
import { getDistanceMeters } from "../utils/geoUtils";

export interface RouteOptions {
  startTime?: Date;
  maxStops?: number;
  filterOpen?: boolean;
  prioritizeNearby?: boolean;
  customStart?: { lat: number; lon: number };
}

export function generateRoute(
  venues: Venue[],
  userLat: number,
  userLon: number,
  opts: RouteOptions = {}
): Venue[] {
  const {
    startTime = new Date(),
    maxStops = 5,
    filterOpen = true,
    prioritizeNearby = true,
    customStart,
  } = opts;

  const originLat = customStart?.lat ?? userLat;
  const originLon = customStart?.lon ?? userLon;

  console.log("🧭 Route generation started");
  console.log("📍 Origin:", originLat, originLon);
  console.log("🗺️ Venue count (raw):", venues.length);

  // Step 1: Filter by open status
  let pool = filterOpen
    ? venues.filter((v) => isVenueOpenNow(v, startTime))
    : [...venues];

  console.log("✅ After openNow filter:", pool.length);

  // Step 2: Filter by proximity — only if not using customStart
  if (!customStart) {
    pool = pool.filter(
      (v) => getDistanceMeters(originLat, originLon, v.lat, v.lon) <= 2414
    );
    console.log("📏 After 1.5 mile filter:", pool.length);
  }

  if (pool.length === 0) {
    console.warn("⚠️ No valid venues found after filtering.");
    return [];
  }

  const route: Venue[] = [];
  let currentTime = startTime;

  // Step 3: Start with the closest venue to origin
  pool.sort(
    (a, b) =>
      getDistanceMeters(originLat, originLon, a.lat, a.lon) -
      getDistanceMeters(originLat, originLon, b.lat, b.lon)
  );

  let current = pool.shift()!;
  route.push(current);

  // Step 4: Build the rest of the crawl
  while (route.length < maxStops && pool.length > 0) {
    const scored = pool.map((v) => {
      const dist = getDistanceMeters(current.lat, current.lon, v.lat, v.lon);
      const duration = v.duration ?? 1.5;
      const score = 1 / (dist + 1); // placeholder scoring
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

  console.log("✅ Final route generated:", route.map(r => r.name));
  return route;
}
