import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import { z } from 'zod'

// --- Types ---
type UUID = string & { __uuidBrand: never }

export type AddFavoriteParams = {
  userId: UUID
  venueId: UUID
  venueData: {
    name: string
    lat: number
    lon: number
    instagram_handle?: string | null
  }
}

export type RemoveFavoriteParams = {
  userId: UUID
  venueId: UUID
}

// --- Zod Schema for Venue Snapshot ---
const favoriteDataSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  instagram_handle: z.string().nullable().optional(),
})

// --- Authenticated Supabase Client ---
async function getClientAndUserId(): Promise<{ supabase: Awaited<ReturnType<typeof createServerClient>>; userId: UUID }> {
  const supabase = createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw new Error(`Auth error: ${error.message}`)
  if (!user) throw new Error('User not authenticated')

  return { supabase, userId: user.id as UUID }
}

// --- Add or Update Favorite ---
export async function addVenueToFavorites({
  userId,
  venueId,
  venueData,
}: AddFavoriteParams): Promise<Database['public']['Tables']['favorites']['Row'][]> {
  const supabase = createServerClient()

  const parsed = favoriteDataSchema.safeParse(venueData)

  if (!parsed.success) {
    console.error('❌ FavoriteData validation failed:', parsed.error.format())
    throw new Error('Invalid venue data format')
  }

  const payload: Database['public']['Tables']['favorites']['Insert'] = {
    user_id: userId,
    venue_id: venueId,
    data: parsed.data,
  }

  const { data, error } = await supabase
    .from('favorites')
    .upsert([payload] as any, { onConflict: 'user_id,venue_id' })
    .select()

  if (error) throw new Error(`Failed to add favorite: ${error.message}`)
  return data ?? []
}

// --- Remove Favorite ---
export async function removeFavorite({ userId, venueId }: RemoveFavoriteParams): Promise<boolean> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('favorites')
    .delete()
    .match({ user_id: userId, venue_id: venueId })

  if (error) throw new Error(`Failed to remove favorite: ${error.message}`)
  return true
}

// --- Get Favorites for Current User ---
export async function getFavorites(): Promise<Database['public']['Tables']['favorites']['Row'][]> {
  const { supabase, userId } = await getClientAndUserId()

  const { data, error } = await supabase
    .from('favorites')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch favorites: ${error.message}`)
  return data ?? []
}
