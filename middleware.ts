import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create Supabase client and attach auth cookie to request
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()

  return res
}
