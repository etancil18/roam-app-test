'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function FavoritesPage() {
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoutes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setRoutes([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_routes')
        .select('*')
        .eq('user_id', user.id)

      setRoutes(data || [])
      setLoading(false)
    }

    fetchRoutes()
  }, [])

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">My Favorites</h1>
      {loading ? (
        <p>Loading...</p>
      ) : routes.length === 0 ? (
        <p>No saved crawls yet.</p>
      ) : (
        <ul className="space-y-4">
          {routes.map((r) => (
            <li key={r.id} className="bg-gray-100 p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{r.name}</h2>
              <ul className="mt-2 space-y-1 pl-4 border-l-4 border-blue-500">
                {r.route_data?.stops?.map((stop: any, idx: number) => (
                  <li key={idx} className="text-sm">
                    <span className="font-medium">{stop.name}</span>
                    {stop.address && ` — ${stop.address}`}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
