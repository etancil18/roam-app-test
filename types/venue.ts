// app/types/venue.ts

export type HoursNumeric = {
  [key: string]: { open: number; close: number } | null;
};

export type Venue = {
  name: string;
  vibe?: string;
  type?: string;
  lat: number;
  lon: number;
  link: string;
  cover?: string;
  openNow?: string | boolean;
  hours?: string[];
  dateEvents?: { date: string; title: string; time: string }[];
  hoursNumeric?: HoursNumeric;
  dayParts?: Record<string, string>;
  timeCategory?: string;
  energyRamp?: number;
  tags?: string;           
  price?: string;           
  neighborhood?: string;    
  duration?: number;
};
