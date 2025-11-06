// app/types/venue.ts

export type HoursNumeric = Record<string, { open: number; close: number } | null>;

export type DateEvent = {
  date: string;
  title: string;
  time: string;
};

export type Venue = {
  id?: string; // ✅ Optional string ID (fallbacks handled in logic)
  name: string;
  lat: number;
  lon: number;
  link: string;

  // Optional metadata
  vibe?: string;
  type?: string;
  cover?: string;
  openNow?: string | boolean;
  hours?: string[];
  dateEvents?: DateEvent[];

  // Derived data
  hoursNumeric?: HoursNumeric;
  dayParts?: Record<string, string>;
  timeCategory?: string;
  energyRamp?: number;

  // Filters
  tags?: string;
  price?: string; // e.g., "$", "$$", "$$$"
  neighborhood?: string;
  duration?: number; // hours
};
