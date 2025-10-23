'use client';

import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useState } from "react";
import atlantaData from "@/data/atlanta";
import nycData from "@/data/nyc";
import { Venue } from "@/types/venue";
import { generateRoute } from "@/lib/routeEngine";

const MapCanvas = dynamic(() => import("@/components/maps/MapCanvas"), {
  ssr: false,
});

function normalize(data: any[]): Venue[] {
  return data.map((d) => ({
    ...d,
    lat: typeof d.lat === "string" ? parseFloat(d.lat) : d.lat,
    lon: typeof d.lon === "string" ? parseFloat(d.lon) : d.lon,
    neighborhood: d.neighborhood ?? "",
    price: d.price ?? "",
    tags: d.tags ?? "",
  })) as Venue[];
}

export default function MapWrapper() {
  const [city, setCity] = useState<'atl' | 'nyc'>('atl');
  const [route, setRoute] = useState<Venue[] | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [durationTarget, setDurationTarget] = useState<number | undefined>(undefined);
  const [customStart, setCustomStart] = useState<{ lat: number; lon: number } | null>(null);

  const allVenues = useMemo(() => {
    const raw = city === 'atl' ? atlantaData : nycData;
    return normalize(raw);
  }, [city]);

  const filteredVenues = useMemo(() => {
    return allVenues.filter((v) => {
      const searchOk =
        searchTerm === "" ||
        v.vibe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.tags?.toLowerCase().includes(searchTerm.toLowerCase());

      const themeOk =
        selectedTheme === "" ||
        v.tags?.toLowerCase().includes(selectedTheme.toLowerCase()) ||
        v.vibe?.toLowerCase().includes(selectedTheme.toLowerCase());

      const neighOk = selectedNeighborhood === "" || v.neighborhood === selectedNeighborhood;
      const priceOk = selectedPrice === "" || v.price === selectedPrice;

      return searchOk && themeOk && neighOk && priceOk;
    });
  }, [allVenues, searchTerm, selectedTheme, selectedNeighborhood, selectedPrice]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const routeIds = params.get("route")?.split(",") ?? [];

    if (routeIds.length && allVenues.length) {
      const matched = routeIds
        .map(id => allVenues.find(v => v.id === id || v.name === id))
        .filter(Boolean) as Venue[];
      setRoute(matched);
    }
  }, [allVenues]);

  const handleMapClick = (lat: number, lon: number) => {
    setCustomStart({ lat, lon });
    alert("Custom start location set — you can now generate your crawl.");
  };

  const handleGenerateRoute = () => {
    const fallbackCoords: Record<'atl' | 'nyc', { lat: number; lon: number }> = {
      atl: { lat: 33.749, lon: -84.388 },
      nyc: { lat: 40.73061, lon: -73.935242 },
    };
    const startLat = customStart?.lat ?? fallbackCoords[city].lat;
    const startLon = customStart?.lon ?? fallbackCoords[city].lon;

    const newRoute = generateRoute(filteredVenues, startLat, startLon, {
      maxStops: 10,
      filterOpen: true,
      customStart: customStart ? { ...customStart } : undefined,
    });

    setRoute(newRoute);
    const ids = newRoute.map(r => r.id ?? r.name).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("route", ids);
    window.history.replaceState(null, '', url.toString());
  };

  const handleClear = () => {
    setRoute(undefined);
    setCustomStart(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("route");
    window.history.replaceState(null, '', url.toString());
  };

  return (
    <main className="h-screen w-screen relative overflow-hidden">
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow p-2 space-x-2">
        <button
          onClick={() => {
            setCity("atl");
            setRoute(undefined);
          }}
          className={`px-4 py-1 rounded ${city === "atl" ? "bg-black text-white" : "bg-gray-200"}`}
        >
          ATL
        </button>
        <button
          onClick={() => {
            setCity("nyc");
            setRoute(undefined);
          }}
          className={`px-4 py-1 rounded ${city === "nyc" ? "bg-black text-white" : "bg-gray-200"}`}
        >
          NYC
        </button>
      </div>

      <div className="absolute top-16 left-4 z-[3000] bg-white rounded-lg shadow p-3 space-y-2 w-64 border border-gray-400">
        <h2 className="text-sm font-semibold text-black">Filters</h2>
        <input
          type="text"
          placeholder="What's the vibe…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        >
          <option value="">Select Theme</option>
          <option value="art & culture">Art & Culture</option>
          <option value="foodie tour">Foodie Tour</option>
          <option value="date night">Date Night</option>
        </select>
        <select
          value={selectedNeighborhood}
          onChange={(e) => setSelectedNeighborhood(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        >
          <option value="">Neighborhood</option>
          <option value="Buckhead">Buckhead</option>
          <option value="Midtown">Midtown</option>
          <option value="Eastside">Eastside</option>
        </select>
        <select
          value={selectedPrice}
          onChange={(e) => setSelectedPrice(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        >
          <option value="">Any Price</option>
          <option value="$">$</option>
          <option value="$$">$$</option>
          <option value="$$$">$$$</option>
        </select>
        <button
          onClick={handleGenerateRoute}
          disabled={filteredVenues.length === 0}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Generate Crawl
        </button>
        <button
          onClick={handleClear}
          className="w-full mt-1 px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Clear Route
        </button>
      </div>

      <Suspense fallback={<div className="text-center p-4">Loading map…</div>}>
        <MapCanvas
          venues={filteredVenues}
          route={route}
          city={city}
          onMapClick={handleMapClick}
        />
      </Suspense>
    </main>
  );
}
