import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { saveRoute } from '@/lib/supabase/routes'

type UUID = string & { __uuidBrand: never }

export async function POST(req: Request) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const { name, stops, city } = await req.json()

    if (!name || !Array.isArray(stops)) {
      return NextResponse.json(
        { success: false, message: 'Invalid route data — name and stops are required' },
        { status: 400 }
      )
    }

    await saveRoute({
      userId: user.id as UUID,
      name,
      stops,
      city,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API /routes/save] Error:', error.message || error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}
