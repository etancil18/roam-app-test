'use client'

import { useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from 'react-leaflet'
import L, { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

import { useSearchParams, useParams } from 'next/navigation'
import { isVenueOpenNow } from '@/utils/timeUtils'
import { coverCandidates } from '@/utils/imageUtils'
import { themeById } from '@/lib/crawlConfig'
import { useRouteStore } from '@/lib/store/routeStore'
import type { Venue } from '@/types/venue'
import type { RouteStop } from '@/validators/favorite'

const daypartColorMap: Record<string, string> = {
  M: 'blue',
  MD: 'green',
  A: 'orange',
  HH: 'gold',
  E: 'violet',
  L: 'red',
}

const themeColorMap: Record<string, string> = {
  'cheap-cheerful': 'green',
  'chill-hang': 'blue',
  'creative-kickstart': 'orange',
  'date-night': 'purple',
  'friends-night-out': 'red',
  'gallery-crawl': 'teal',
  'patio-perfection': 'pink',
  'saturday-surge': 'gold',
  'solo-explorer': 'gray',
  'sunset-lovers': 'violet',
  'sunday-reset': 'olive',
  'work-session': 'cyan',
}

function RouteControl({ route, color = 'cyan' }: { route: Venue[]; color?: string }) {
  const map = useMap()
  useEffect(() => {
    if (!route || route.length < 2) return
    const waypoints = route.map((v) => L.latLng(v.lat, v.lon))
    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      plan: L.Routing.plan(waypoints, {
        createMarker: () => false,
      }),
      lineOptions: {
        styles: [{ color, weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
    })
    control.addTo(map)
    return () => {
      map.removeControl(control)
    }
  }, [route, color, map])
  return null
}

function MapRefSetter({ mapRef }: { mapRef: React.MutableRefObject<LeafletMap | null> }) {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
    return undefined
  }, [map])
  return null
}

function numberedMarkerIcon(number: number) {
  return new L.DivIcon({
    className: 'numbered‑marker',
    html: `<div style="background:#333;color:white;border‑radius:50%;width:24px;height:24px;display:flex;align‑items:center;justify‑content:center;font‑size:12px;">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
}

export default function MapCanvas({
  venues,
  route,
  city,
  onMapClick,
  themeId,
}: {
  venues: Venue[]
  route?: Venue[]
  city: 'atl' | 'nyc'
  onMapClick?: (lat: number, lon: number) => void
  themeId?: string
}) {
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRefs = useRef<Record<string, L.Marker>>({})
  const [isFavoriting, setIsFavoriting] = useState(false)

  const {
    storeCenter,
    focusVenueSlug,
    setCurrentRoute,
    setCenter: setStoreCenter,
    clearFocusVenueSlug,
    currentRoute,
  } = useRouteStore()

  const searchParams = useSearchParams()
  const params = useParams()

  const cityCenters: Record<string, [number, number]> = {
    atl: [33.749, -84.388],
    nyc: [40.73061, -73.935242],
  }

  const defaultCenter = cityCenters[city] ?? [40.73, -73.93]
  const centerFromStore = storeCenter || defaultCenter
  const validVenues = venues.filter((v) => v.slug && Number.isFinite(v.lat) && Number.isFinite(v.lon))
  const lineColor = themeColorMap[themeId ?? ''] ?? 'cyan'
  const themeName = themeId ? themeById[themeId]?.name : null

  useEffect(() => {
  const map = mapRef.current
  const newCenter = cityCenters[city]

  if (map && newCenter) {
    const currentZoom = map.getZoom()
    const zoomOutLevel = 4
    const targetZoom = 12

    map.flyTo(map.getCenter(), zoomOutLevel, {
      animate: true,
      duration: 1.25,
    })

    setTimeout(() => {
      map.flyTo(newCenter, targetZoom, {
        animate: true,
        duration: 1.75,
      })
    }, 600)
  }
}, [city])

  // Hydrate route by slug OR legacy URL
  useEffect(() => {
    const slugParam = params?.slug as string | undefined
    if (slugParam) {
      fetch(`/api/routes/getBySlug?slug=${slugParam}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed fetching route by slug')
          return res.json()
        })
        .then((data: { stops: RouteStop[] }) => {
          const mapped: Venue[] = data.stops.map((stop: RouteStop) => ({
            id: stop.name,
            slug: stop.name.toLowerCase().replace(/\s+/g, '-'),
            name: stop.name,
            lat: stop.lat,
            lon: stop.lon,
            type: stop.type,
            link: '',
            instagram_handle: undefined,
            cover: stop.image_url || undefined,
            tags: undefined,
            tier: undefined,
            timeCategory: undefined,
            energyRamp: undefined,
            price: undefined,
            duration: undefined,
            city,
          }))
          setCurrentRoute(mapped)
          setStoreCenter(mapped[0].lat, mapped[0].lon)
        })
        .catch((err) => console.error('❌ Failed to load route via slug:', err))
      return
    }

    // Legacy route via ?route=...
    const encodedRoute = searchParams?.get('route')
    if (encodedRoute) {
      try {
        const stops: RouteStop[] = JSON.parse(atob(encodedRoute))
        const mapped: Venue[] = stops.map((stop: RouteStop) => ({
          id: stop.name,
          slug: stop.name.toLowerCase().replace(/\s+/g, '-'),
          name: stop.name,
          lat: stop.lat,
          lon: stop.lon,
          type: stop.type,
          link: '',
          instagram_handle: undefined,
          cover: stop.image_url || undefined,
          tags: undefined,
          tier: undefined,
          timeCategory: undefined,
          energyRamp: undefined,
          price: undefined,
          duration: undefined,
          city,
        }))
        setCurrentRoute(mapped)
        setStoreCenter(mapped[0].lat, mapped[0].lon)
        console.warn('⚠️ Loaded crawl via legacy ?route= param')
      } catch (err) {
        console.error('❌ Failed to decode route from URL:', err)
      }
    }
  }, [params, searchParams, clearFocusVenueSlug, setCurrentRoute, setStoreCenter, city])

  useEffect(() => {
    const r = route?.length && route.length > 0 ? route : currentRoute
    if (mapRef.current && r && r.length) {
      const bounds = L.latLngBounds(r.map((v) => [v.lat, v.lon] as [number, number]))
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [route, currentRoute])

  const visibleVenues = route?.length && route.length > 0 ? route : validVenues

  useEffect(() => {
    const map = mapRef.current
    if (map && onMapClick) {
      const handler = (e: L.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng)
      map.on('click', handler)
      return () => {
        map.off('click', handler)
      }
    }
    return undefined
  }, [onMapClick])

  async function handleAddToFavorites(venue: Venue) {
    try {
      if (!venue.slug) return alert('Venue slug missing')
      setIsFavoriting(true)
      const res = await fetch('/api/favorites/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: venue.slug, venueData: venue }),
      })
      if (!res.ok) throw new Error(await res.text())
      alert(`⭐ Added "${venue.name}" to favorites`)
    } catch (err) {
      alert('❌ Could not add to favorites')
      console.error(err)
    } finally {
      setIsFavoriting(false)
    }
  }

  return (
    <div className="h-screen w-screen relative">
      {themeName && (
        <div className="absolute top-4 right-4 z-[1000] bg-white text-gray-800 px-3 py-1 rounded shadow text-xs font-semibold">
          Theme: {themeName}
        </div>
      )}
      <MapContainer center={centerFromStore} zoom={12} className="h-full w-full z-0">
        <MapRefSetter mapRef={mapRef} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {visibleVenues.map((v, idx) => {
          const today = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()]
          const isOpen = isVenueOpenNow(v)
          const dp = v.dayParts?.[today] || ''
          const color = isOpen ? daypartColorMap[dp] || 'gray' : 'black'

          const icon = route?.length && route.length > 0
            ? numberedMarkerIcon(idx + 1)
            : new L.Icon({
                iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
                shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              })

          const firstCandidate = coverCandidates(v)[0]

          return (
            <Marker
              key={v.slug ?? v.name}
              position={[v.lat, v.lon]}
              icon={icon}
              ref={(ref) => {
                if (v.slug && ref) {
                  markerRefs.current[v.slug] = ref
                }
              }}
            >
              <Tooltip>{v.name}</Tooltip>
              <Popup>
                <div style={{ fontSize: 14 }}>
                  <strong>{v.name}</strong>
                  {v.cover || firstCandidate ? (
                    <img
                      src={`/${v.cover || firstCandidate}`}
                      alt={v.name}
                      style={{ width: '100%', maxHeight: 140, objectFit: 'cover', margin: '6px 0' }}
                    />
                  ) : null}
                  <div><em>Vibe:</em> {v.vibe || 'N/A'}</div>
                  <div><em>Status:</em> <span style={{ color: isOpen ? 'green' : 'red' }}>{isOpen ? 'Open' : 'Closed'}</span></div>
                  {v.link && <a href={v.link} target="_blank" rel="noopener noreferrer">More Info</a>}
                  <button
                    onClick={() => handleAddToFavorites(v)}
                    disabled={isFavoriting}
                    style={{ marginTop: 6, width: '100%', padding: '6px' }}
                  >
                    {isFavoriting ? 'Adding...' : 'Add to Favorites'}
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {((route && route.length > 1) || currentRoute.length > 1) && (
          <RouteControl route={route?.length ? route : currentRoute} color={lineColor} />
        )}
      </MapContainer>
    </div>
  )
}
