'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { UserRoute, Stop } from '../../types/roam'


export default function Page() {
  const [userId, setUserId] = useState<string | null>(null)
  const [routes, setRoutes] = useState<UserRoute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      console.log("Logged in user:", user)
      if (userError) console.error("User error:", userError)

      if (!user) {
        setUserId(null)
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data, error } = await supabase
        .from('user_routes')
        .select('*')
        .eq('user_id', user.id)

      console.log("Fetched routes:", data)
      if (error) console.error("Route query error:", error)

      setRoutes(data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  return (
    <main className="min-h-screen p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">My Saved Crawls</h1>
      <p className="text-sm mb-4 text-gray-600">Logged in user: {userId ?? 'None'}</p>
      {loading ? (
        <p>Loading...</p>
      ) : routes.length === 0 ? (
        <p>No saved crawls yet.</p>
      ) : (
        <ul className="space-y-6">
          {routes.map((r: UserRoute) => (
            <li key={r.id} className="bg-gray-100 p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-2">{r.name}</h2>
              {r.route_data?.stops?.length > 0 ? (
                <ul className="space-y-1 pl-4 border-l-4 border-blue-500">
                  {r.route_data?.stops?.map((loc: Stop, idx: number) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium">{loc.name}</span>
                      {loc.address && ` — ${loc.address}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No stops in route.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
