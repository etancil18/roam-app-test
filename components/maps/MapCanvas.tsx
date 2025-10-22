'use client';

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvent,
} from "react-leaflet";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// --- Types ---
type HoursNumeric = {
  [key: string]: { open: number; close: number } | null;
};

type Venue = {
  name: string;
  vibe?: string;
  type?: string;
  lat: number;
  lon: number;
  link: string;
  cover?: string;
  openNow?: string | boolean;
  hours?: string[];
  dateEvents?: { date: string; title: string; time: string }[];
  hoursNumeric?: HoursNumeric;
  dayParts?: Record<string, string>;
  timeCategory?: string;
  energyRamp?: number;
  tags?: string;
  price?: string;
  duration?: number;
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
function RouteControl({ route }: { route: Venue[] }) {
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
        styles: [{ color: "cyan", weight: 4 }],
        extendToWaypoints: false,
        missingRouteTolerance: 0,
      },
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [route, map]);

  return null;
}

// --- Map Recentering Logic ---
function MapControl({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 12, { animate: true });
  }, [center, map]);

  return null;
}

// --- Map Click Handler Component ---
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lon: number) => void }) {
  useMapEvent("click", (e) => {
    if (onMapClick) {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    }
  });
  return null;
}

// --- Main MapCanvas Component ---
export default function MapCanvas({
  venues,
  route,
  city,
  onMapClick,
}: {
  venues: Venue[];
  route?: Venue[];
  city: "atl" | "nyc";
  onMapClick?: (lat: number, lon: number) => void;
}) {
  const cityCenters: Record<string, [number, number]> = {
    atl: [33.749, -84.388],
    nyc: [40.73061, -73.935242],
  };

  const center = cityCenters[city];

  return (
    <div className="h-screen w-screen relative">
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors & Carto"
        />

        <MapControl center={center} />

        {/* Handle map clicks for manual pin-drop fallback */}
        <MapClickHandler onMapClick={onMapClick} />

        {venues.map((loc, idx) => {
          if (
            !loc.lat ||
            !loc.lon ||
            Number.isNaN(loc.lat) ||
            Number.isNaN(loc.lon)
          ) {
            console.warn("⚠️ Skipping venue with invalid coords:", loc);
            return null;
          }

          const today = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
            new Date().getDay()
          ];
          const dp = loc.dayParts?.[today] || "";
          const color = daypartColorMap[dp] || "gray";

          const icon = new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
            shadowUrl:
              "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });

          return (
            <Marker key={idx} position={[loc.lat, loc.lon]} icon={icon}>
              <Popup>
                <strong>{loc.name}</strong>
                <br />
                {loc.vibe && (
                  <span className="text-xs italic">{loc.vibe}</span>
                )}
                <br />
                <a
                  href={loc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  More Info
                </a>
              </Popup>
            </Marker>
          );
        })}

        {route && route.length > 1 && <RouteControl route={route} />}
      </MapContainer>
    </div>
  );
}
