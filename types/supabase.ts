// types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export type Stop = {
  id?: string | null
  name: string
  address?: string | null
  lat: number
  lon: number
}

export type RouteData = {
  stops: Stop[]
}

export type Tier = 'standard' | 'premium' | 'exclusive' | null

// ✅ Explicit hardcoded version of FavoriteData
export type FavoriteData = {
  name: string
  lat: number
  lon: number
  instagram_handle?: string | null
}

// ✅ Explicit hardcoded version of FavoriteRecord
export type FavoriteRecord = {
  id: string
  user_id: string
  venue_id: string
  data: FavoriteData | null
  created_at: string | null
}

interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }

      venues: {
        Row: {
          id: string
          name: string
          lat: number
          lon: number
          instagram_handle: string | null
          access_token: string | null
          tags: string[] | null
          tier: Tier
        }
        Insert: {
          id?: string
          name: string
          lat: number
          lon: number
          instagram_handle?: string | null
          access_token?: string | null
          tags?: string[] | null
          tier?: Tier
        }
        Update: {
          name?: string
          lat?: number
          lon?: number
          instagram_handle?: string | null
          access_token?: string | null
          tags?: string[] | null
          tier?: Tier
        }
        Relationships: []
      }

      favorites: {
        Row: FavoriteRecord
        Insert: {
          user_id: string
          venue_id: string
          data: FavoriteData
        }
        Update: {
          user_id?: string
          venue_id?: string
          data?: FavoriteData | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'favorites_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      user_routes: {
        Row: {
          id: string
          user_id: string
          name: string
          route_data: RouteData
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          route_data: RouteData
          created_at?: string
        }
        Update: {
          name?: string
          route_data?: RouteData
        }
        Relationships: [
          {
            foreignKeyName: 'user_routes_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      events: {
        Row: {
          id: string
          venue_id: string
          title: string
          event_date: string
          source: string
          permalink: string
        }
        Insert: {
          id?: string
          venue_id: string
          title: string
          event_date: string
          source: string
          permalink: string
        }
        Update: {
          title?: string
          event_date?: string
          source?: string
          permalink?: string
        }
        Relationships: [
          {
            foreignKeyName: 'events_venue_id_fkey'
            columns: ['venue_id']
            referencedRelation: 'venues'
            referencedColumns: ['id']
          }
        ]
      }
    }

    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ✅ Export all primary types
export type { Database }
