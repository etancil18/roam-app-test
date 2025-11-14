import type { Json } from '@/types/supabase'
import { RouteStopsArraySchema, RouteStop } from '@/validators/favorite'

export function parseRouteStops(raw: Json | null): RouteStop[] {
  if (!raw || !Array.isArray(raw)) return []

  const result = RouteStopsArraySchema.safeParse(raw)

  if (!result.success) {
    console.warn('[parseRouteStops] Invalid route stops:', result.error.format?.())
    return []
  }

  return result.data
}
