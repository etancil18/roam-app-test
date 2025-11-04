// lib/supabase/favorites.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { Venue } from '@/types/venue'

type FavoritesInsert = Database['public']['Tables']['favorites']['Insert']

/**
 * Resolves the current user ID from the session, or throws.
 */
async function resolveUserId(supabase: SupabaseClient<Database>, override?: string): Promise<string> {
  if (override) return override

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('User not authenticated')
  return user.id
}

/**
 * Adds a venue to the user's favorites, or updates if already exists.
 */
export async function addVenueToFavorites(
  supabase: SupabaseClient<Database, any, any>,
  venue: Venue,
  userId?: string
) {
  const resolvedUserId = await resolveUserId(supabase, userId)

  const insertData: FavoritesInsert = {
    user_id: resolvedUserId,
    venue_id: venue.id ?? venue.name, // fallback if no ID
    data: venue,
  }

  const { data, error } = await supabase
    .from('favorites')
    .upsert([insertData], { onConflict: 'user_id,venue_id' })
    .select()

  if (error) throw error
  return data
}

/**
 * Removes a venue from the user's favorites.
 */
export async function removeFavorite(
  supabase: SupabaseClient<Database>,
  venueId: string,
  userId?: string
) {
  const resolvedUserId = await resolveUserId(supabase, userId)

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', resolvedUserId)
    .eq('venue_id', venueId)

  if (error) throw error
  return true
}

/**
 * Fetches all favorites for the user.
 */
export async function getFavorites(
  supabase: SupabaseClient<Database>,
  userId?: string
) {
  const resolvedUserId = await resolveUserId(supabase, userId)

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', resolvedUserId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
