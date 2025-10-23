'use client';

import { useState } from "react";
import { Venue } from "@/types/venue";

export default function CrawlControl({
  venues,
  route,
  onRoute,
  durationTarget,
  selectedTheme,
  customStart,
  city,
}: {
  venues: Venue[];
  route?: Venue[];
  onRoute: (route: Venue[]) => void;
  durationTarget?: number;
  selectedTheme: string;
  customStart?: { lat: number; lon: number } | null;
  city: "atl" | "nyc";
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerateCrawl() {
    setLoading(true);

    const fallbackCoords: Record<"atl" | "nyc", { lat: number; lon: number }> = {
      atl: { lat: 33.749, lon: -84.388 },
      nyc: { lat: 40.73061, lon: -73.935242 },
    };

    const startLat = customStart?.lat ?? fallbackCoords[city].lat;
    const startLon = customStart?.lon ?? fallbackCoords[city].lon;

    try {
      const resp = await fetch("/api/generate-crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venues,
          userLat: startLat,
          userLon: startLon,
          options: {
            maxStops: 10,
            maxDuration: durationTarget,
            theme: selectedTheme.trim().toLowerCase(),
            customStart: customStart ? { ...customStart } : undefined,
          },
        }),
      });

      const j = await resp.json();
      if (j.route) {
        onRoute(j.route);
      } else {
        console.error("No route in response", j);
      }
    } catch (err) {
      console.error("Fetch error generating crawl:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!route || route.length < 2) return alert("Need at least 2 stops to save.");
    const existing = localStorage.getItem("savedRoutes");
    const routes = existing ? JSON.parse(existing) : [];
    routes.push([...route]);
    localStorage.setItem("savedRoutes", JSON.stringify(routes));
    alert("Saved to favorites (local only for now)");
  }

  function handleExport() {
    if (!route) return;
    const base = "https://www.google.com/maps/dir/";
    const waypoints = route.map((r) => `${r.lat},${r.lon}`).join("/");
    window.open(`${base}${waypoints}`, "_blank");
  }

  function handleCopy() {
    if (!route) return;
    const ids = route.map((r) => r.id ?? r.name).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("route", ids);
    navigator.clipboard.writeText(url.toString()).then(() => setCopied(true));
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClear() {
    onRoute([]);
    setCopied(false);
    location.reload();
  }

  return (
    <div className="absolute bottom-4 left-4 z-[2000] bg-white p-3 rounded-xl shadow-lg w-72 border border-gray-300">
      <button
        onClick={handleGenerateCrawl}
        disabled={loading || venues.length === 0}
        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        {loading ? "Generating…" : "Generate Crawl"}
      </button>

      {route && route.length > 0 && (
        <div className="mt-3 space-y-2 text-sm">
          <h3 className="font-semibold text-gray-800">Your Crawl:</h3>
          <ol className="list-decimal pl-5 space-y-1 max-h-40 overflow-y-auto">
            {route.map((stop, i) => (
              <li key={i}>
                <a
                  href={stop.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {stop.name}
                </a>
              </li>
            ))}
          </ol>

          <div className="pt-2 border-t border-gray-200 space-y-1">
            <button
              onClick={handleSave}
              className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600 transition"
            >
              💾 Save
            </button>
            <button
              onClick={handleExport}
              className="w-full bg-green-500 text-white py-1 rounded hover:bg-green-600 transition"
            >
              🌍 Export to Maps
            </button>
            <button
              onClick={handleCopy}
              className="w-full bg-gray-700 text-white py-1 rounded hover:bg-gray-800 transition"
            >
              🔗 {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={handleClear}
              className="w-full bg-red-500 text-white py-1 rounded hover:bg-red-600 transition"
            >
              ❌ Clear Route
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
