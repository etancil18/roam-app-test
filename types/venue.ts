// app/types/venue.ts

export type HoursNumeric = {
  [key: string]: { open: number; close: number } | null;
};

export type Venue = {
  name: string;
  lat: number;
  lon: number;
  link: string;
  vibe?: string;
  hoursNumeric?: HoursNumeric;
  dayParts?: Record<string, string>;
  // add other optional fields as needed, e.g.:
  duration?: number;
  type?: string;
  energyRamp?: number;
  timeCategory?: string;
  // etc.
};
