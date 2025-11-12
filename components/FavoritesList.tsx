'use client'

import type { FavoriteRecord, SavedRouteRecord } from '@/types/supabase'
import RemoveFavoriteButton from '@/app/favorites/remove-favorite-button'

type FavoriteVenueData = {
  name: string
  lat: number
  lon: number
  instagram_handle?: string | null
}

type SavedRouteData = {
  name: string
  stops: unknown[]
  city?: string | null
}

type CombinedFavorite =
  | { type: 'venue'; record: FavoriteRecord; data: FavoriteVenueData | null }
  | { type: 'route'; record: SavedRouteRecord; data: SavedRouteData | null }

export default function FavoritesList({ favorites }: { favorites: CombinedFavorite[] }) {
  if (!favorites.length) {
    return <p className="text-gray-500">You haven’t saved any favorites or routes yet.</p>
  }

  return (
    <ul className="space-y-6">
      {favorites.map((item) => {
        if (item.type === 'venue') {
          const fav = item.record
          const data = fav.data as FavoriteVenueData | null

          return (
            <li
              key={`venue-${fav.id}`}
              className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-md font-semibold text-gray-900">
                    {data?.name || 'Unnamed Venue'}
                  </h3>

                  {data?.lat != null && data?.lon != null && (
                    <p className="text-sm text-gray-600">
                      📍 Location: {data.lat}, {data.lon}
                    </p>
                  )}

                  {data?.instagram_handle && (
                    <a
                      href={`https://instagram.com/${data.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm underline"
                    >
                      @{data.instagram_handle}
                    </a>
                  )}

                  {fav.created_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Added on {new Date(fav.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <RemoveFavoriteButton venueId={fav.venue_id} />
              </div>
            </li>
          )
        } else {
          // --- Route type ---
          const route = item.record
          const data = route as SavedRouteData

          return (
            <li
              key={`route-${route.id}`}
              className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-md font-semibold text-blue-700">
                    🗺️ Route: {route.name || 'Unnamed Route'}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {Array.isArray(route.stops)
                      ? `Stops: ${route.stops.length}`
                      : 'Stops: N/A'}
                  </p>

                  {route.city && (
                    <p className="text-sm text-gray-600">City: {route.city}</p>
                  )}

                  {route.created_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Saved on {new Date(route.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Optional: Route removal logic */}
                <button
                  className="text-red-600 text-sm underline"
                  onClick={() => {
                    console.warn('Remove route not implemented yet')
                  }}
                >
                  Remove Route
                </button>
              </div>
            </li>
          )
        }
      })}
    </ul>
  )
}
