'use client'

import { useTransition } from 'react'
import { removeFavoriteAction } from 'app/favorites/actions'  // ← adjust if path differs

type Props = {
  venueId: string
  onRemoved?: () => void
}

export default function RemoveFavoriteButton({ venueId, onRemoved }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!venueId) {
      console.error('❌ Missing venueId for removal')
      return
    }

    const confirmDelete = confirm('Are you sure you want to remove this favorite?')
    if (!confirmDelete) return

    startTransition(async () => {
      try {
        // removeFavoriteAction returns void — success = no error thrown.
        await removeFavoriteAction(venueId)

        // Trigger callback to refresh UI.
        onRemoved?.()
      } catch (error) {
        console.error('❌ Failed to remove favorite:', error)
        alert('Something went wrong removing this favorite.')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`text-sm rounded px-3 py-1 transition-colors ${
        isPending
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-red-600 hover:bg-red-100 hover:text-red-800'
      }`}
    >
      {isPending ? 'Removing…' : 'Remove'}
    </button>
  )
}
