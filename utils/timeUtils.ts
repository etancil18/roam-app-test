// app/utils/timeUtils.ts

import { Venue } from "../types/venue";

export function isVenueOpenNow(venue: Venue, dateTime: Date): boolean {
  const hoursNumeric = venue.hoursNumeric;
  if (!hoursNumeric) return true;

  const dayKeys = ["sun","mon","tue","wed","thu","fri","sat"];
  const dayKey = dayKeys[dateTime.getDay()];
  const prevDayKey = dayKeys[(dateTime.getDay() + 6) % 7];
  const currentHour = dateTime.getHours() + dateTime.getMinutes() / 60;

  const today = hoursNumeric[dayKey];
  const prev = hoursNumeric[prevDayKey];

  if (today) {
    const { open, close } = today;
    if (close > open) {
      if (currentHour >= open && currentHour < close) return true;
    } else {
      // wraps past midnight
      if (currentHour >= open || currentHour < (close % 24)) return true;
    }
  }
  if (prev && prev.close > 24) {
    if (currentHour < (prev.close % 24)) return true;
  }

  return false;
}
