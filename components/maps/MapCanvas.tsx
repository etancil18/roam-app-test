'use client';

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import atlantaData from "../../data/atlanta";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export default function MapCanvas() {
  useEffect(() => {
    import("leaflet/dist/leaflet.css");
  }, []);

  return (
    <MapContainer center={[33.749, -84.388]} zoom={12} className="h-full w-full z-0">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap contributors & Carto"
      />
      {atlantaData.map((loc, idx) => (
        <Marker key={idx} position={[loc.lat, loc.lon]}>
          <Popup>
            <strong>{loc.name}</strong>
            <br />
            <a href={loc.link} target="_blank" rel="noopener noreferrer">
              More Info
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
