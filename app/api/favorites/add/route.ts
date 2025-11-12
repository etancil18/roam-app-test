import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { addVenueToFavorites } from '@/lib/supabase/favorites'
import { getVenueBySlug } from '@/lib/supabase/venues'

// --- UUID Type ---
type UUID = string & { __uuidBrand: never }

// --- UUID Validator ---
function validateUUID(uuid: string): uuid is UUID {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { slug, venueData } = await req.json()

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid slug' },
        { status: 400 }
      )
    }

    const venue = await getVenueBySlug(slug)

    if (!venue || !validateUUID(venue.id)) {
      return NextResponse.json(
        { success: false, message: 'Venue not found or has invalid ID' },
        { status: 404 }
      )
    }

    const result = await addVenueToFavorites({
      userId: user.id as UUID,
      venueId: venue.id,
      venueData,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('[API /favorites/add] Error:', error.message || error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}
