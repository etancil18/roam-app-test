'use server'

export {}

import { createServerClient } from '@/lib/supabase/server'
import { removeFavorite } from '@/lib/supabase/favorites'
import { revalidatePath } from 'next/cache'

// --- UUID type ---
type UUID = string & { __uuidBrand: never }

// --- UUID validator (type guard) ---
function validateUUID(uuid: string): uuid is UUID {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)
}

// --- Server Action ---
export async function removeFavoriteAction(venueId: string) {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.error('❌ Not authenticated')
    throw new Error('Not authenticated')
  }

  if (!validateUUID(venueId)) {
    console.error('❌ Invalid venue ID:', venueId)
    throw new Error('Invalid venue ID format')
  }

  try {
    await removeFavorite({
      userId: user.id as UUID,
      venueId, // already type-guarded by validateUUID()
    })

    // ✅ Refresh the /favorites page after deletion
    revalidatePath('/favorites')
  } catch (err) {
    console.error('❌ Failed to remove favorite:', err)
    throw new Error('Failed to remove favorite')
  }
}
