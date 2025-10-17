'use client';

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import atlantaData from "../../data/atlanta";
import nycData from "../../data/nyc";

console.log("NYC Data:", nycData);

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

// --- Map icon setup ---
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function MapCanvas() {
  const [city, setCity] = useState<"atl" | "nyc">("atl");

  console.log("Type of nycData:", typeof nycData);
  console.log("Is Array?", Array.isArray(nycData));
  console.log("nycData Preview:", nycData?.[0]);

  const normalizeData = (data: any[]): Venue[] =>
    data.map((d) => ({
      ...d,
      lat: typeof d.lat === "string" ? parseFloat(d.lat) : d.lat,
      lon: typeof d.lon === "string" ? parseFloat(d.lon) : d.lon,
    }));

  const venueData: Venue[] = city === "atl" ? normalizeData(atlantaData) : normalizeData(nycData);
  const center = city === "atl" ? [33.749, -84.388] : [40.73061, -73.935242];

  return (
    <div className="h-screen w-screen relative">
      {/* City Toggle */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow p-2 space-x-2">
        <button
          onClick={() => setCity("atl")}
          className={`px-4 py-1 rounded ${city === "atl" ? "bg-black text-white" : "bg-gray-200"}`}
        >
          ATL
        </button>
        <button
          onClick={() => setCity("nyc")}
          className={`px-4 py-1 rounded ${city === "nyc" ? "bg-black text-white" : "bg-gray-200"}`}
        >
          NYC
        </button>
      </div>

      {/* Map */}
      <MapContainer center={center as any} zoom={12} className="h-full w-full z-0">
        <Recenter center={center as any} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors & Carto"
        />
        {venueData.map((loc, idx) => (
          <Marker key={idx} position={[loc.lat, loc.lon]}>
            <Popup>
              <strong>{loc.name}</strong>
              <br />
              {loc.vibe && <span className="text-xs italic">{loc.vibe}</span>}
              <br />
              <a href={loc.link} target="_blank" rel="noopener noreferrer">
                More Info
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
