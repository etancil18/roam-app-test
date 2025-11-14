'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, PlusCircle, Trash2, Tag } from 'lucide-react'
import { useRouteStore } from '@/lib/store/routeStore'
import { removeFavoriteAction } from '@/app/favorites/actions'
import type { FavoriteVenueData } from '@/validators/favorite'
import type { FavoriteRecord } from '@/types/supabase'
import type { Venue } from '@/types/venue'

type FavoriteWithParsedData = FavoriteRecord & { data: FavoriteVenueData }

export default function FavoritesVenuesList({
  venues,
}: {
  venues: FavoriteWithParsedData[]
}) {
  const router = useRouter()
  const { addStop } = useRouteStore()
  const [isPending, startTransition] = useTransition()

  const toVenue = (fav: FavoriteWithParsedData): Venue => ({
    id: fav.venue_id,
    slug: fav.venue_id,
    name: fav.data.name,
    lat: fav.data.lat,
    lon: fav.data.lon,
    instagram_handle: fav.data.instagram_handle || undefined,
    link: '',
    type: fav.data.type || undefined,
    cover: fav.data.image_url || undefined,
    tags: fav.data.vibe_tags?.join(', ') || undefined,
    tier: undefined,
    timeCategory: undefined,
    energyRamp: undefined,
    price: fav.data.price_tier ? String(fav.data.price_tier) : undefined,
    duration: undefined,
    city: fav.city || undefined,
  })

  async function handleRemove(venueId: string) {
    const confirmDelete = confirm('Are you sure you want to remove this favorite?')
    if (!confirmDelete) return

    startTransition(async () => {
      try {
        await removeFavoriteAction(venueId)
        router.refresh()
      } catch (error) {
        console.error('❌ Failed to remove favorite:', error)
        alert('Something went wrong removing this favorite.')
      }
    })
  }

  if (!venues.length) {
    return <p className="text-sm text-gray-500">No favorited venues yet.</p>
  }

  return (
    <ul className="space-y-4">
      {venues.map((fav) => {
        const { name, lat, lon, type, image_url, vibe_tags } = fav.data

        if (!fav.data) {
          console.warn('⚠️ fav missing data:', fav)
          return null
        }

        return (
          <li
            key={fav.id}
            className="bg-white rounded-2xl shadow p-4 flex items-start gap-4 border border-gray-200"
          >
            <img
              src={
                image_url ||
                `https://maps.googleapis.com/maps/api/streetview?size=120x120&location=${lat},${lon}&key=YOUR_GOOGLE_MAPS_API_KEY`
              }
              alt={name}
              className="w-16 h-16 rounded-lg object-cover"
            />

            <div className="flex-1">
              <h3 className="font-semibold text-base">{name}</h3>
              <p className="text-sm text-gray-500 capitalize">
                {type || 'Unknown type'}
              </p>

              {vibe_tags?.length ? (
                <div className="flex gap-1 flex-wrap mt-1">
                  {vibe_tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      <Tag size={12} /> {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex gap-3 flex-wrap">
                <button
                  className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
                  onClick={() => {
                    router.push(`/?focus=${fav.venue_id}&lat=${lat}&lon=${lon}`)
                  }}
                >
                  <MapPin size={14} /> View on Map
                </button>

                <button
                  className="text-xs flex items-center gap-1 text-green-700 hover:underline"
                  onClick={() => {
                    addStop(toVenue(fav))
                    router.push('/')
                  }}
                >
                  <PlusCircle size={14} /> Add to Crawl
                </button>

                <button
                  className={`text-xs flex items-center gap-1 ${
                    isPending
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-red-600 hover:underline'
                  }`}
                  onClick={() => handleRemove(fav.venue_id)}
                  disabled={isPending}
                >
                  <Trash2 size={14} /> {isPending ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
