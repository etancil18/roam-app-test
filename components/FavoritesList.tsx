// components/FavoritesList.tsx

'use client'

import React from 'react'
import type { CombinedFavorite } from '@/types/ui'
import SavedCrawlsList from './SavedCrawlsList'
import { getEmojiForType } from '@/utils/emoji'

export default function FavoritesList({
  favorites,
  onDeleteCrawl,
}: {
  favorites: CombinedFavorite[]
  onDeleteCrawl?: (routeId: string) => void
}) {
  const venues = favorites.filter((f) => f.type === 'venue')
  const routes = favorites.filter((f) => f.type === 'route')

  return (
    <div className="space-y-10">
      {routes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">🗺️ Saved Crawls</h2>
          <SavedCrawlsList
            routes={routes.map((r) => r.record)}
            onDeleteRoute={onDeleteCrawl}
          />
        </section>
      )}

      {venues.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">⭐ Favorite Venues</h2>
          <ul className="grid md:grid-cols-2 gap-4">
            {venues.map((v) => (
              <li
                key={v.record.id}
                className="bg-white rounded-xl p-4 shadow border border-gray-200"
              >
                <h3 className="font-semibold">{v.data.name}</h3>
                <p className="text-xs text-gray-500">{v.record.city}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg">
                    {getEmojiForType(v.data.type)}
                  </span>
                  <span className="text-sm">{v.data.type ?? 'Unknown type'}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {favorites.length === 0 && (
        <p className="text-sm text-gray-500">You haven’t saved anything yet.</p>
      )}
    </div>
  )
}
