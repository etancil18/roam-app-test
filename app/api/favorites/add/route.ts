// app/api/favorites/add/route.ts
import { NextResponse } from 'next/server'
import { addVenueToFavorites } from '@/lib/supabase/favorites'

export async function POST(req: Request) {
  const { venue, userId } = await req.json()

  try {
    const result = await addVenueToFavorites(venue, userId)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    )
  }
}
