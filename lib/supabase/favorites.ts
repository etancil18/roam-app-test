// lib/supabase/favorites.ts

import { supabaseServerComponent } from '@/lib/supabase/serverClient'
import type { FavoriteRecord, FavoriteData } from '@/types/supabase'
import type { Venue } from '@/types/venue'
import { z } from 'zod'

// ✅ Runtime validator for FavoriteData
const favoriteDataSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  instagram_handle: z.string().nullable().optional(),
})

// ✅ Internal helper to get Supabase client + user ID
async function getClientAndUserId() {
  const supabase = supabaseServerComponent()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw new Error(`Auth error: ${error.message}`)
  if (!user) throw new Error('User not authenticated')

  return { supabase, userId: user.id }
}

// ➕ Add or update a favorite venue
export async function addVenueToFavorites(
  venue: Venue,
  passedUserId?: string,
  note?: string
): Promise<FavoriteRecord[]> {
  const { supabase, userId } = await getClientAndUserId()
  const finalUserId = passedUserId ?? userId

  // ✅ Prepare and validate the JSON data stored inside "favorites.data"
  const favoriteData: FavoriteData = {
    name: venue.name,
    lat: venue.lat,
    lon: venue.lon,
    instagram_handle: venue.link ?? null,
  }

  const parsed = favoriteDataSchema.safeParse(favoriteData)
  if (!parsed.success) {
    console.error('❌ FavoriteData validation failed:', parsed.error.format())
    throw new Error('Invalid venue data format')
  }

  // ✅ Explicit Insert payload type (not derived)

const insertPayload = {
  user_id: finalUserId,
  venue_id: venue.id ?? venue.name,
  data: parsed.data,
}

const { data, error } = await supabase
  .from('favorites')
  .upsert([insertPayload] as any, { onConflict: 'user_id,venue_id' })
  .select()


  if (error) throw new Error(`Failed to add favorite: ${error.message}`)
  return data ?? []
}

// ❌ Remove a favorite
export async function removeFavorite(venueId: string): Promise<boolean> {
  const { supabase, userId } = await getClientAndUserId()

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('venue_id', venueId)

  if (error) throw new Error(`Failed to remove favorite: ${error.message}`)
  return true
}

// 📥 Get all user favorites
export async function getFavorites(): Promise<FavoriteRecord[]> {
  const { supabase, userId } = await getClientAndUserId()

  const { data, error } = await supabase
    .from('favorites')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch favorites: ${error.message}`)
  return data ?? []
}
