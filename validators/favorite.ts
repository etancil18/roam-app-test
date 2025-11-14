import { z } from 'zod'

//
// Favorite Venue Snapshot — stored in `favorites.data` (JSONB)
//
export const FavoriteVenueDataSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  instagram_handle: z.string().nullable().optional(),
  type: z.string().optional(),
  image_url: z.string().nullable().optional(),
  vibe_tags: z.array(z.string()).optional(),
  price_tier: z.number().optional(),
})

export type FavoriteVenueData = z.infer<typeof FavoriteVenueDataSchema>

//
// A Single Stop in a Saved Route — stored in `saved_routes.stops` (JSONB[])
//
export const RouteStopSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  type: z.string().optional(),
  image_url: z.string().nullable().optional(),
})

export const RouteStopsArraySchema = z.array(RouteStopSchema)

export type RouteStop = z.infer<typeof RouteStopSchema>
export type RouteStopArray = z.infer<typeof RouteStopsArraySchema>

//
// Utility: Validate and parse `favorites.data` blob
//
export function parseFavoriteVenueData(raw: unknown): FavoriteVenueData | null {
  const result = FavoriteVenueDataSchema.safeParse(raw)
  if (!result.success) {
    console.error('[parseFavoriteVenueData] Invalid favorite data:', result.error.format())
    return null
  }
  return result.data
}

//
// Utility: Validate and parse `saved_routes.stops` blob
//
export function parseRouteStops(raw: unknown): RouteStop[] {
  const result = RouteStopsArraySchema.safeParse(raw)
  if (!result.success) {
    console.error('[parseRouteStops] Invalid route stops:', result.error.format())
    return []
  }
  return result.data
}
