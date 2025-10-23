// lib/supabase/favorites.ts

import { supabase } from "./client";
import type { Database } from "@/types/supabase";
import type { Venue } from "@/types/venue";

type FavoritesInsert = Database["public"]["Tables"]["favorites"]["Insert"];

/**
 * Resolves the current user ID, or throws if unauthenticated.
 */
async function resolveUserId(overrideUserId?: string): Promise<string> {
  if (overrideUserId) return overrideUserId;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User not authenticated");

  return user.id;
}

/**
 * Adds or updates a venue in the user's favorites.
 */
export async function addVenueToFavorites(venue: Venue, userId?: string) {
  const resolvedUserId = await resolveUserId(userId);

  const insertData: FavoritesInsert = {
    user_id: resolvedUserId,
    venue_id: venue.id ?? venue.name,
    data: venue, // ✅ Required field added
  };

  const { data, error } = await supabase
    .from("favorites")
    .upsert([insertData], { onConflict: "user_id,venue_id" })
    .select();

  if (error) throw error;
  return data;
}

/**
 * Fetches the current user's list of favorite venues.
 */
export async function getFavorites(userId?: string) {
  const resolvedUserId = await resolveUserId(userId);

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", resolvedUserId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Removes a venue from the user's favorites.
 */
export async function removeFavorite(venueId: string, userId?: string) {
  const resolvedUserId = await resolveUserId(userId);

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", resolvedUserId)
    .eq("venue_id", venueId);

  if (error) throw error;
  return true;
}
