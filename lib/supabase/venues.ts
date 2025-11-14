import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type VenueRow = Database['public']['Tables']['venues']['Row']

/**
 * Fetches all venues for a given city.
 */
export async function getVenuesByCity(city: 'atl' | 'nyc'): Promise<VenueRow[]> {
  const supabase = await createServerClient()

  const { data: rawData, error } = await supabase
    .from('venues')
    .select('*')
    .eq('city', city)

  if (error) throw new Error(`Failed to fetch venues for ${city}: ${error.message}`)

  const data = (rawData ?? []) as VenueRow[]

  const invalid = data.filter((v) => !v.slug || !v.id)
  if (invalid.length) {
    console.warn('⚠️ Venues missing slug/id:', invalid.map((v) => ({ id: v.id, slug: v.slug })))
  }

  return data
}

/**
 * Fetches a venue by its slug.
 */
export async function getVenueBySlug(slug: string): Promise<VenueRow | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .single()

  if (error) {
    console.error(`Error fetching venue by slug "${slug}":`, error.message)
    return null
  }

  return data
}

/**
 * Fetches a venue by its unique ID.
 */
export async function getVenueById(id: string): Promise<VenueRow | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .limit(1)
    .single()

  if (error) {
    console.error(`Error fetching venue by ID "${id}":`, error.message)
    return null
  }

  return data
}
