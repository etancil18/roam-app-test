import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname

  const protectedRoutes = ['/', '/favorites']
  const isProtected = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  )

  const isLogin = pathname === '/login'

  // 🔐 If not authenticated and accessing a protected route
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 🔁 If authenticated and accessing /login, redirect to home (/)
  if (isLogin && user) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/favorites', '/login'],
}
