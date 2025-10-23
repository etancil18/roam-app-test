// utils/timeUtils.ts

export function _dayKey(d: Date): string {
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][d.getDay()];
}

export function _ranges(x: any): any[] {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

export function _intervalsForDate(d: Date, hours: Record<string, any>): [Date, Date][] {
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
  const zero = new Date(y, m, day);
  zero.setHours(0, 0, 0, 0);

  const at = (h: number) => new Date(zero.getTime() + h * 3600 * 1000);
  const out: [Date, Date][] = [];

  _ranges(hours[_dayKey(d)] || []).forEach((r: any) => {
    if (r.open != null && r.close != null) {
      out.push([at(r.open), at(r.close)]);
    }
  });

  const yst = new Date(zero);
  yst.setDate(zero.getDate() - 1);

  _ranges(hours[_dayKey(yst)] || []).forEach((r: any) => {
    if (r.close > 24) {
      const yz = new Date(yst);
      yz.setHours(0, 0, 0, 0);
      out.push([
        new Date(yz.getTime() + r.open * 3600 * 1000),
        new Date(yz.getTime() + r.close * 3600 * 1000),
      ]);
    }
  });

  return out;
}

export function daypartAllowedForNow(
  loc: { dayParts?: Record<string, string> | null },
  now: Date
): boolean {
  const dp =
    typeof loc.dayParts === "object" &&
    loc.dayParts !== null &&
    !Array.isArray(loc.dayParts)
      ? loc.dayParts[_dayKey(now)]
      : null;

  if (!dp || dp === "-") return true;

  const hour = now.getHours() + now.getMinutes() / 60;
  const letter = String(dp).toUpperCase();

  const windowByLetter: Record<string, [number, number]> = {
    M: [5, 12],
    MD: [10, 15],
    A: [12, 17],
    HH: [16, 19],
    E: [17, 24],
    L: [22, 28],
  };

  const w = windowByLetter[letter];
  if (!w) return true;

  const [start, end] = w;
  return end <= 24
    ? hour >= start && hour < end
    : hour >= start || hour < end - 24;
}

import type { Venue } from "@/types/venue";

export function isVenueOpenNow(venue: Venue, atTime: Date = new Date()): boolean {
  const hours = venue.hoursNumeric || {};
  const intervals = _intervalsForDate(atTime, hours);
  return intervals.some(([open, close]) => atTime >= open && atTime < close);
}
