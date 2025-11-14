'use server'

import { createServerClient } from '@/lib/supabase/server'
import { removeFavorite } from '@/lib/supabase/favorites'
import { revalidatePath } from 'next/cache'

// --- UUID Type & Validator ---
type UUID = string & { __uuidBrand: never }

function validateUUID(uuid: string): uuid is UUID {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)
}

// --- Server Action: Remove Favorite ---
export async function removeFavoriteAction(venueId: string): Promise<void> {
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('❌ Not authenticated')
    throw new Error('Not authenticated')
  }

  if (!validateUUID(venueId)) {
    console.error('❌ Invalid venue ID format:', venueId)
    throw new Error('Invalid venue ID format')
  }

  try {
    await removeFavorite({
      userId: user.id as UUID,
      venueId,
    })

    // ✅ Refresh the /favorites page after deletion
    revalidatePath('/favorites')
  } catch (err) {
    console.error('❌ Failed to remove favorite:', err)
    throw new Error('Failed to remove favorite')
  }
}
