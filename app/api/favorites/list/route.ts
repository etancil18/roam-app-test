import { NextResponse } from 'next/server'
import { getFavorites } from '@/lib/supabase/favorites'

export async function GET() {
  try {
    const data = await getFavorites()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[API /favorites/list] Error:', error)
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    )
  }
}
