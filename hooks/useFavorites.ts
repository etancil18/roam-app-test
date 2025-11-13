// hooks/useFavorites.ts
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/clientOnly';
import type { Venue } from '@/types/venue';

export function useFavorites(city: 'atl' | 'nyc') {
  const [favorites, setFavorites] = useState<(Venue & { city: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      const { data, error } = await supabaseBrowser
        .from('favorites')
        .select('data, city')
        .eq('city', city);

      console.log('[useFavorites] fetched rows for city:', city, data);

      if (error) {
        console.error('[useFavorites] Error fetching favorites:', error);
        setFavorites([]);
        setLoading(false);
        return;
      }

      if (Array.isArray(data)) {
        // Attach city to each venue data object
        const mapped = data.map((row: any) => ({
          ...row.data,
          city: row.city,
        })) as (Venue & { city: string })[];

        setFavorites(mapped);
      } else {
        setFavorites([]);
      }

      setLoading(false);
    }

    fetchFavorites();
  }, [city]);

  return { favorites, loading };
}
