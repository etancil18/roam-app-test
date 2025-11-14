// utils/inferCity.ts

import type { Venue } from '@/types/venue'

export function inferCityFromVenue(venue: Venue): 'atl' | 'nyc' | null {
  if (!venue || !venue.lat || !venue.lon) return null

  const lat = parseFloat(venue.lat.toString())
  const lon = parseFloat(venue.lon.toString())

  const isAtlanta =
    lat > 33 && lat < 34 && lon > -85 && lon < -84

  const isNYC =
    lat > 40 && lat < 41 && lon > -74.5 && lon < -73

  if (isAtlanta) return 'atl'
  if (isNYC) return 'nyc'
  return null
}
