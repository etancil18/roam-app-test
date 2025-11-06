// components/maps/MapCanvas.tsx
'use client';

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import { isVenueOpenNow } from "@/utils/timeUtils";
import { coverCandidates } from "@/utils/imageUtils";
import { themeById } from "@/lib/crawlConfig";
import type { Venue } from "@/types/venue";

import type { Database } from '@/types/supabase'

// --- Types ---
type HoursNumeric = {
  [key: string]: { open: number; close: number } | null;
};


// --- Daypart Color Map ---
const daypartColorMap: Record<string, string> = {
  M: "blue",
  MD: "green",
  A: "orange",
  HH: "gold",
  E: "violet",
  L: "red",
};

// --- Routing Layer Control ---
function RouteControl({ route, color = "cyan" }: { route: Venue[]; color?: string }) {
  const map = useMap();

  useEffect(() => {
    if (!route || route.length < 2) return;

    const waypoints = route.map((v) => L.latLng(v.lat, v.lon));

    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      plan: L.Routing.plan(waypoints, {
        draggableWaypoints: false,
        addWaypoints: false,
        createMarker: () => false,
      }),
      lineOptions: {
        styles: [{ color, weight: 4 }],
        extendToWaypoints: false,
        missingRouteTolerance: 0,
      },
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [route, map, color]);

  return null;
}

function MapControl({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 12, { animate: true });
  }, [center, map]);

  return null;
}

function numberedMarkerIcon(number: number) {
  return new L.DivIcon({
    className: 'numbered-marker',
    html: `<div style="background:#333;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

export default function MapCanvas({
  venues,
  route,
  city,
  onMapClick,
  themeId,
}: {
  venues: Venue[];
  route?: Venue[];
  city: "atl" | "nyc";
  onMapClick?: (lat: number, lon: number) => void;
  themeId?: string;
}) {
  const cityCenters: Record<string, [number, number]> = {
    atl: [33.749, -84.388],
    nyc: [40.73061, -73.935242],
  };

  const center = cityCenters[city];
  const mapRef = useRef<LeafletMap | null>(null);
  const [isFavoriting, setIsFavoriting] = useState(false);
  


  useEffect(() => {
    const map = mapRef.current;
    if (map && onMapClick) {
      const handler = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      };
      map.on("click", handler);
      return () => {
        map.off("click", handler);
      };
    }
  }, [onMapClick]);

  useEffect(() => {
    if (!mapRef.current || !Array.isArray(route) || route.length < 2) return;
    const bounds = L.latLngBounds(route.map(r => [r.lat, r.lon]));
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [route]);

  const themeName = themeId ? themeById[themeId]?.name : null;
  const themeColorMap: Record<string, string> = {
    "cheap-cheerful": "green",
    "chill-hang": "blue",
    "creative-kickstart": "orange",
    "date-night": "purple",
    "friends-night-out": "red",
    "gallery-crawl": "teal",
    "patio-perfection": "pink",
    "saturday-surge": "gold",
    "solo-explorer": "gray",
    "sunset-lovers": "violet",
    "sunday-reset": "olive",
    "work-session": "cyan",
  };

  const lineColor = themeColorMap[themeId ?? ""] ?? "cyan";

  // ✅ Add this function to call the server API
async function handleAddToFavorites(venue: Venue) {
  try {
    const res = await fetch('/api/favorites/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venue }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to add favorite');
    }
  } catch (error) {
    console.error('[MapCanvas] Error adding favorite:', error);
    throw error; // Re-throw so UI can catch it
  }
}

  return (
    <div className="h-screen w-screen relative">
      {themeName && (
        <div className="absolute top-4 right-4 z-[1000] bg-white text-gray-800 px-3 py-1 rounded shadow text-xs font-semibold">
          Theme: {themeName}
        </div>
      )}
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full z-0"
        ref={(mapInstance) => {
          mapRef.current = mapInstance as LeafletMap;
        }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors & Carto"
        />

        <MapControl center={center} />

        {venues.map((locRaw, idx) => {
          const loc = locRaw as Venue;

          if (!Number.isFinite(loc.lat) || !Number.isFinite(loc.lon)) return null;

          const today = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()];
          const isOpen = isVenueOpenNow(loc);
          const dp = loc.dayParts?.[today] || "";
          const color = isOpen ? daypartColorMap[dp] || "gray" : "black";

          const candidates = coverCandidates(loc);
          const firstCandidate = candidates[0];

          const isInRoute = Array.isArray(route) && route.some((r: Venue) => (r.id ?? r.name) === (loc.id ?? loc.name));
          const routeIndex = Array.isArray(route)
            ? route.findIndex((r: Venue) => (r.id ?? r.name) === (loc.id ?? loc.name))
            : -1;

          const icon = isInRoute
            ? numberedMarkerIcon(routeIndex + 1)
            : new L.Icon({
                iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
                shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              });

          return (
            <Marker key={idx} position={[loc.lat, loc.lon]} icon={icon}>
              <Popup>
                <div style={{ fontSize: "14px", lineHeight: 1.4 }}>
                  <strong>{loc.name}</strong><br />
                  {loc.cover ? (
                    <img
                        src={`/${loc.cover}`} // ✅ Only prepend single slash
                        alt={loc.name}
                        style={{
                        width: "100%",
                        maxHeight: 140,
                        objectFit: "cover",
                        borderRadius: 8,
                        margin: "6px 0",
                        }}
                    />
                    ) : firstCandidate ? (
                    <img
                        src={`/${firstCandidate}`} // ✅ Also root-relative
                        alt={loc.name}
                        style={{
                        width: "100%",
                        maxHeight: 140,
                        objectFit: "cover",
                        borderRadius: 8,
                        margin: "6px 0",
                        }}
                    />
                    ) : null}

                  <em>Vibe:</em> {loc.vibe || "N/A"}<br />
                  <em>Status:</em> <span style={{ color: isOpen ? "green" : "red" }}>{isOpen ? "Open Now" : "Closed"}</span><br />
                  <a href={loc.link} target="_blank" rel="noopener noreferrer">More Info</a>
                  <hr />
                  <button
                    onClick={async () => {
                      try {
                        setIsFavoriting(true);
                        await handleAddToFavorites(loc as Venue);
                        alert(`⭐ Added "${loc.name}" to your favorites`);
                      } catch (error) {
                        console.error("Error adding favorite:", error);
                        alert("❌ Could not add to favorites");
                      } finally {
                        setIsFavoriting(false);
                      }
                    }}
                    disabled={isFavoriting}
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: "6px",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    {isFavoriting ? "Adding..." : "Add to Favorites"}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {route && route.length > 1 && <RouteControl route={route} color={lineColor} />}
      </MapContainer>
    </div>
  );
}
