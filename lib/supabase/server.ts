import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

/**
 * Returns a fully typed Supabase client for server-side usage (Next.js Route Handlers or Server Components).
 * Note: This is synchronous — no need to use `await`.
 */
export function createServerClient() {
  return createRouteHandlerClient<Database>({
    cookies,
  })
}
