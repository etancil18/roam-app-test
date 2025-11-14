import type {
  FavoriteRecord,
  SavedRouteRecord,
} from '@/types/supabase'

import type {
  FavoriteVenueData,
  RouteStop,
} from '@/validators/favorite'

// A unified favorite item, either a venue or a saved route
export type CombinedFavorite =
  | {
      type: 'venue'
      record: FavoriteRecord & { data: FavoriteVenueData }
      data: FavoriteVenueData
    }
  | {
      type: 'route'
      record: SavedRouteRecord & { stops: RouteStop[] }
      data: RouteStop[]
    }
