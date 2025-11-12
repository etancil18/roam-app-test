// app/favorites/page.tsx

import { getFavorites as getVenueFavorites } from '@/lib/supabase/favorites'
import { getSavedRoutes } from '@/lib/supabase/routes'
import FavoritesList from '@/components/FavoritesList'
import type { FavoriteRecord, SavedRouteRecord } from '@/types/supabase'

type CombinedFavorite =
  | { type: 'venue'; record: FavoriteRecord; data: any }
  | { type: 'route'; record: SavedRouteRecord; data: any }

export default async function FavoritesPage() {
  let combined: CombinedFavorite[] = []

  try {
    const [venueFavs, savedRoutes] = await Promise.all([
      getVenueFavorites(),
      getSavedRoutes(),
    ])

    const mappedVenues: CombinedFavorite[] = venueFavs.map((v) => ({
      type: 'venue',
      record: v,
      data: v.data,
    }))

    const mappedRoutes: CombinedFavorite[] = savedRoutes.map((r) => ({
      type: 'route',
      record: r,
      data: r.stops,
    }))

    // Combine and sort newest first
    combined = [...mappedRoutes, ...mappedVenues].sort((a, b) => {
      const dateA =
        a.type === 'venue'
          ? new Date(a.record.created_at ?? 0).getTime()
          : new Date(a.record.created_at ?? 0).getTime()
      const dateB =
        b.type === 'venue'
          ? new Date(b.record.created_at ?? 0).getTime()
          : new Date(b.record.created_at ?? 0).getTime()
      return dateB - dateA
    })
  } catch (error: any) {
    const isAuthError = error.message?.toLowerCase().includes('not authenticated')

    return (
      <main className="min-h-screen p-8 bg-white text-black">
        <h1 className="text-2xl font-bold mb-4">My Favorites</h1>
        {isAuthError ? (
          <p className="text-gray-500">
            Please log in to view your saved routes and favorite venues.
          </p>
        ) : (
          <p className="text-red-600">
            Unable to load data. Please try again later.
          </p>
        )}
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">My Favorites</h1>
      <FavoritesList favorites={combined} />
    </main>
  )
}
