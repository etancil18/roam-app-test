// lib/store/routeStore.ts
import { create } from 'zustand'
import type { Venue } from '@/types/venue'

interface RouteStore {
  center: [number, number] | null
  storeCenter: [number, number] | null
  focusVenueSlug: string | null
  currentRoute: Venue[]
  setCenter: (lat: number, lon: number) => void
  setFocusVenue: (slug: string | null) => void
  clearFocusVenueSlug: () => void
  setCurrentRoute: (route: Venue[]) => void
  addStop: (venue: Venue) => void
  removeStop: (slug: string) => void
  clearRoute: () => void
}

export const useRouteStore = create<RouteStore>((set) => ({
  center: null,
  storeCenter: null,
  focusVenueSlug: null,
  currentRoute: [],

  setCenter: (lat, lon) => set({ storeCenter: [lat, lon] }),

  setFocusVenue: (slug) => set({ focusVenueSlug: slug }),

  clearFocusVenueSlug: () => set({ focusVenueSlug: null }),

  setCurrentRoute: (route) => set({ currentRoute: route }),

  addStop: (venue) =>
    set((state) => ({
      currentRoute: [...state.currentRoute, venue],
    })),

  removeStop: (slug) =>
    set((state) => ({
      currentRoute: state.currentRoute.filter((v) => v.slug !== slug),
    })),

  clearRoute: () => set({ currentRoute: [] }),
}))
