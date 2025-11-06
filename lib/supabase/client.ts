import {
  createPagesBrowserClient,
  createServerComponentClient,
  createServerActionClient,
} from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const supabaseBrowser = createPagesBrowserClient<Database>()

export function supabaseServerComponent() {
  return createServerComponentClient<Database>({ cookies })
}

export function supabaseServerAction() {
  return createServerActionClient<Database>({ cookies })
}
