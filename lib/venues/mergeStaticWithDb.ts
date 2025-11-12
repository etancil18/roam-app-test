import type { Database } from '@/types/supabase'
import type { Venue, StaticVenue } from '@/types/venue'

type VenueRecord = Database['public']['Tables']['venues']['Row']

export function mergeStaticWithDb(staticVenues: StaticVenue[], dbVenues: VenueRecord[]): Venue[] {
  const dbMap = new Map(dbVenues.map(v => [v.slug ?? '', v]))

  return staticVenues.map((sv) => {
    const match = sv.slug ? dbMap.get(sv.slug) : null

    if (!sv.slug) {
      console.warn('[mergeStaticWithDb] Static venue missing slug:', sv.name)
    }

    if (!match && sv.slug) {
      console.warn('[mergeStaticWithDb] No DB match for static slug:', sv.slug)
    }

    const merged: Venue = {
      id: match?.id ?? `temp-${sv.slug ?? sv.name}`, // fallback id for non-DB venues
      slug: sv.slug ?? match?.slug ?? '',
      name: sv.name ?? match?.name ?? 'Unnamed',
      link: sv.link ?? match?.instagram_handle ?? '', // 🔒 required
      lat: match?.lat ?? sv.lat,
      lon: match?.lon ?? sv.lon,
      instagram_handle: match?.instagram_handle ?? sv.instagram_handle ?? undefined,
      vibe: sv.vibe ?? undefined,
      cover: sv.cover ?? match?.cover ?? undefined,
      type: Array.isArray(sv.type) ? sv.type.join(', ') : sv.type ?? match?.type ?? undefined,
      timeCategory: sv.timeCategory ?? match?.time_category ?? undefined,
      energyRamp: sv.energyRamp ?? match?.energy_ramp ?? undefined,
      price: sv.price ?? match?.price ?? undefined,
      duration: sv.duration ?? match?.duration ?? undefined,
      tags: typeof sv.tags === 'string' ? sv.tags : match?.tags?.join(', ') ?? undefined,
      tier: sv.tier ?? match?.tier ?? undefined,
      city: match?.city ?? sv.city ?? undefined,
      hours: sv.hours,
      hoursNumeric: sv.hoursNumeric,
      dayParts: sv.dayParts,
      openNow: sv.openNow,
      dateEvents: sv.dateEvents,
    }

    return merged
  })
}
