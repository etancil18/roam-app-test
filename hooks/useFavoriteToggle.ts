import { useState } from 'react'
import type { Venue } from '@/types/venue'

export function useFavoriteToggle() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addFavorite(venue: Venue): Promise<boolean> {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/favorites/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: venue.slug,
          venueData: {
            name: venue.name,
            lat: venue.lat,
            lon: venue.lon,
            instagram_handle: venue.instagram_handle ?? null,
            type: venue.type,
            image_url: venue.cover ?? null,
            vibe_tags: venue.tags ? venue.tags.split(',').map((t) => t.trim()) : [],
            price_tier: venue.price ? parseInt(venue.price) : undefined,
          },
          city: venue.city ?? null,
        }),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Failed to add favorite')
      }

      return true
    } catch (err: any) {
      console.error('❌ Error adding favorite:', err)
      setError(err.message || 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    addFavorite,
    loading,
    error,
  }
}
