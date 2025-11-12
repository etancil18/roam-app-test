import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/clientOnly';
import type { Venue } from '@/types/venue';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = supabaseBrowser;

    async function fetchFavorites() {
      const { data, error } = await supabase
        .from('favorites')
        .select('data') // assuming this is the column name storing the venue
        .returns<{ data: Venue }[]>(); // 👈 tells TS what to expect

      if (error) {
        console.error('[useFavorites] Error fetching favorites:', error);
      } else if (Array.isArray(data)) {
        setFavorites(data.map((d) => d.data));
      }

      setLoading(false);
    }

    fetchFavorites();
  }, []);

  return { favorites, loading };
}
