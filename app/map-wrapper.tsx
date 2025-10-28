'use client';

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import atlantaData from "@/data/atlanta";
import nycData from "@/data/nyc";
import type { Venue } from "@/types/venue";
import type { RouteOptions } from "@/lib/routeEngine";
import CrawlControl from "@/components/maps/CrawlControl";

const MapCanvas = dynamic(() => import("@/components/maps/MapCanvas"), {
  ssr: false,
});

function normalizeVenues(data: any[]): Venue[] {
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
  const [city, setCity] = useState<"atl" | "nyc">("atl");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [route, setRoute] = useState<Venue[] | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [customStart, setCustomStart] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    const raw = city === "atl" ? atlantaData : nycData;
    setVenues(normalizeVenues(raw));
    setRoute(undefined);
    setCustomStart(null);
  }, [city]);

  useEffect(() => {
    const filtered = venues.filter((v) => {
      const matchesSearch =
        !searchTerm ||
        v.vibe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.tags?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTheme =
        !selectedTheme ||
        v.tags?.toLowerCase().includes(selectedTheme.toLowerCase()) ||
        v.vibe?.toLowerCase().includes(selectedTheme.toLowerCase());

      const matchesNeighborhood =
        !selectedNeighborhood || v.neighborhood === selectedNeighborhood;

      const matchesPrice = !selectedPrice || v.price === selectedPrice;

      return matchesSearch && matchesTheme && matchesNeighborhood && matchesPrice;
    });

    setFilteredVenues(filtered);
  }, [venues, searchTerm, selectedTheme, selectedNeighborhood, selectedPrice]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const routeParam = params.get("route");
    if (!routeParam || venues.length === 0) return;

    const ids = routeParam.split(",");
    const matched = ids
      .map((id) => venues.find((v) => v.id === id || v.name === id))
      .filter((v): v is Venue => !!v);

    if (matched.length > 0) {
      setRoute(matched);
    }
  }, [venues]);

  const handleCityChange = (newCity: "atl" | "nyc") => {
    setCity(newCity);
  };

  const handleMapClick = (lat: number, lon: number) => {
    setCustomStart({ lat, lon });
    alert("Custom start location set. Generate your crawl when ready.");
  };

  const handleGenerateRoute = async () => {
    const fallbackCoords: Record<"atl" | "nyc", { lat: number; lon: number }> = {
      atl: { lat: 33.749, lon: -84.388 },
      nyc: { lat: 40.73061, lon: -73.935242 },
    };

    const startLat = customStart?.lat ?? fallbackCoords[city].lat;
    const startLon = customStart?.lon ?? fallbackCoords[city].lon;

    const options: RouteOptions = {
      maxStops: 6,
      filterOpen: true,
      customStart: customStart ?? undefined,
      startTime: new Date(),
    };

    try {
      const response = await fetch("/api/generate-crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venues: filteredVenues,
          userLat: startLat,
          userLon: startLon,
          options,
        }),
      });

      const data = await response.json();
      if (!Array.isArray(data.route)) {
        console.error("❌ Invalid route format", data);
        alert("Failed to build a route. Try different filters.");
        return;
      }

      setRoute(data.route);

      const ids = data.route.map((v: Venue) => v.id ?? v.name).join(",");
      const url = new URL(window.location.href);
      url.searchParams.set("route", ids);
      window.history.replaceState(null, "", url.toString());
    } catch (err) {
      console.error("Generate Crawl Error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  const handleClearRoute = () => {
    setRoute(undefined);
    setCustomStart(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("route");
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <main className="h-screen w-screen relative overflow-hidden">
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow p-2 space-x-2">
        <button
          onClick={() => handleCityChange("atl")}
          className={`px-4 py-1 rounded ${city === "atl" ? "bg-black text-white" : "bg-gray-200"}`}
        >
          ATL
        </button>
        <button
          onClick={() => handleCityChange("nyc")}
          className={`px-4 py-1 rounded ${city === "nyc" ? "bg-black text-white" : "bg-gray-200"}`}
        >
          NYC
        </button>
      </div>

      <div className="absolute top-16 left-4 z-[3000] bg-white rounded-lg shadow p-3 space-y-2 w-64 border border-gray-400">
        <h2 className="text-sm font-semibold text-black">Filters</h2>
        <input
          type="text"
          placeholder="Search vibe or tag…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
        <select value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)} className="w-full px-2 py-1 border rounded">
          <option value="">Select Theme</option>
          <option value="art & culture">Art & Culture</option>
          <option value="foodie tour">Foodie Tour</option>
          <option value="date night">Date Night</option>
        </select>
        <select value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)} className="w-full px-2 py-1 border rounded">
          <option value="">Neighborhood</option>
          <option value="Buckhead">Buckhead</option>
          <option value="Midtown">Midtown</option>
          <option value="Eastside">Eastside</option>
        </select>
        <select value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} className="w-full px-2 py-1 border rounded">
          <option value="">Any Price</option>
          <option value="$">$</option>
          <option value="$$">$$</option>
          <option value="$$$">$$$</option>
        </select>

        <button onClick={handleClearRoute} className="w-full mt-1 px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
          Clear Route
        </button>
      </div>

      <CrawlControl
        venues={filteredVenues}
        route={route}
        onRoute={setRoute}
        selectedTheme={selectedTheme}
        customStart={customStart}
        city={city}
        onGenerateRoute={handleGenerateRoute}
      />

      <Suspense fallback={<div className="text-center p-4 text-white">Loading map…</div>}>
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
