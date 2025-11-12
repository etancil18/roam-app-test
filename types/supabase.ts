// types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string;
          user_id: string;
          venue_id: string;
          created_at: string | null;
          data: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          venue_id: string;
          created_at?: string | null;
          data?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          venue_id?: string;
          created_at?: string | null;
          data?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_venue_id_fkey';
            columns: ['venue_id'];
            isOneToOne: false;
            referencedRelation: 'venues';
            referencedColumns: ['id'];
          }
        ];
      };

      saved_routes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          stops: Json;
          city: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          stops: Json;
          city?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          stops?: Json;
          city?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_routes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      user_routes: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          route_data: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          route_data?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          route_data?: Json | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_routes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      events: {
        Row: {
          id: string;
          venue_id: string;
          title: string | null;
          event_date: string | null;
          source: string | null;
          permalink: string | null;
        };
        Insert: {
          id?: string;
          venue_id: string;
          title?: string | null;
          event_date?: string | null;
          source?: string | null;
          permalink?: string | null;
        };
        Update: {
          id?: string;
          venue_id?: string;
          title?: string | null;
          event_date?: string | null;
          source?: string | null;
          permalink?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'events_venue_id_fkey';
            columns: ['venue_id'];
            isOneToOne: false;
            referencedRelation: 'venues';
            referencedColumns: ['id'];
          }
        ];
      };

      venues: {
        Row: {
          id: string;
          name: string | null;
          lat: number | null;
          lon: number | null;
          instagram_handle: string | null;
          access_token: string | null;
          tags: string[] | null;
          tier: string | null;
          type: string | null;
          time_category: string | null;
          energy_ramp: number | null;
          price: string | null;
          duration: number | null;
          cover: string | null;
          city: string | null;
          slug: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          lat?: number | null;
          lon?: number | null;
          instagram_handle?: string | null;
          access_token?: string | null;
          tags?: string[] | null;
          tier?: string | null;
          type?: string | null;
          time_category?: string | null;
          energy_ramp?: number | null;
          price?: string | null;
          duration?: number | null;
          cover?: string | null;
          city?: string | null;
          slug?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          lat?: number | null;
          lon?: number | null;
          instagram_handle?: string | null;
          access_token?: string | null;
          tags?: string[] | null;
          tier?: string | null;
          type?: string | null;
          time_category?: string | null;
          energy_ramp?: number | null;
          price?: string | null;
          duration?: number | null;
          cover?: string | null;
          city?: string | null;
          slug?: string | null;
        };
        Relationships: [];
      };

      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// --- Convenience Types ---
export type FavoriteRecord = Database['public']['Tables']['favorites']['Row']
export type FavoriteInsert = Database['public']['Tables']['favorites']['Insert']
export type FavoriteUpdate = Database['public']['Tables']['favorites']['Update']

export type SavedRouteRecord = Database['public']['Tables']['saved_routes']['Row']
export type SavedRouteInsert = Database['public']['Tables']['saved_routes']['Insert']
export type SavedRouteUpdate = Database['public']['Tables']['saved_routes']['Update']

export type UserRouteRecord = Database['public']['Tables']['user_routes']['Row']
export type VenueRecord = Database['public']['Tables']['venues']['Row']
export type EventRecord = Database['public']['Tables']['events']['Row']
export type UserRecord = Database['public']['Tables']['users']['Row']

