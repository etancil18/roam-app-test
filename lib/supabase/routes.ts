import { createServerClient } from './server'
import type { Database, Json, SavedRouteInsert, SavedRouteRecord } from '@/types/supabase'

type UUID = string & { __uuidBrand: never }

export async function saveRoute({
  userId,
  name,
  stops,
  city,
}: {
  userId: UUID
  name: string
  stops: Json
  city?: string
}) {
  // Explicitly type Supabase client to ensure correct generics
  const supabase = createServerClient() as unknown as import('@supabase/supabase-js').SupabaseClient<Database>

  const payload: SavedRouteInsert = {
    user_id: userId,
    name,
    stops,
    city,
  }

  const { error } = await supabase
    .from('saved_routes')
    .insert([payload])

  if (error) {
    console.error('[saveRoute] Error inserting route:', error)
    throw new Error('Failed to save route')
  }

  return { success: true }
}

export async function getSavedRoutes(): Promise<SavedRouteRecord[]> {
  const supabase = createServerClient() as unknown as import('@supabase/supabase-js').SupabaseClient<Database>

  const { data, error } = await supabase
    .from('saved_routes')
    .select('*')

  if (error) {
    console.error('[getSavedRoutes] Error:', error)
    throw new Error('Failed to fetch saved routes')
  }

  return (data ?? []) as SavedRouteRecord[]
}
