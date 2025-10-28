'use client';

import { useState } from "react";
import type { Venue } from "@/types/venue";

type CrawlControlProps = {
  venues: Venue[];
  route?: Venue[];
  onRoute: (route: Venue[]) => void;
  selectedTheme: string;
  customStart?: { lat: number; lon: number } | null;
  city: "atl" | "nyc";
  onGenerateRoute: () => Promise<void>; // ✅ new required prop
};

export default function CrawlControl({
  venues,
  route,
  onRoute,
  selectedTheme,
  customStart,
  city,
  onGenerateRoute,
}: CrawlControlProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      await onGenerateRoute(); // ✅ delegated to MapWrapper
    } finally {
      setLoading(false);
    }
  }

  function handleSaveToLocal() {
    if (!Array.isArray(route) || route.length < 2) {
      alert("Need at least 2 stops to save.");
      return;
    }
    const existing = localStorage.getItem("savedRoutes");
    const savedRoutes = existing ? JSON.parse(existing) : [];
    savedRoutes.push(route);
    localStorage.setItem("savedRoutes", JSON.stringify(savedRoutes));
    alert("Saved to local favorites.");
  }

  function handleExportToMaps() {
    if (!Array.isArray(route) || route.length < 2) return;
    const base = "https://www.google.com/maps/dir/";
    const waypoints = route.map((v: Venue) => `${v.lat},${v.lon}`).join("/");
    window.open(`${base}${waypoints}`, "_blank");
  }

  function handleCopyLink() {
    if (!Array.isArray(route) || route.length === 0) return;
    const ids = route.map((v: Venue) => v.id ?? v.name).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("route", ids);

    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleClear() {
    onRoute([]);
    const url = new URL(window.location.href);
    url.searchParams.delete("route");
    window.history.replaceState(null, "", url.toString());
    setCopied(false);
  }

  return (
    <div className="absolute bottom-4 left-4 z-[2000] bg-white p-3 rounded-xl shadow-lg w-72 border border-gray-300">
      <button
        onClick={handleGenerate}
        disabled={loading || venues.length === 0}
        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        {loading ? "Generating…" : "Generate Crawl"}
      </button>

      {Array.isArray(route) && route.length > 0 && (
        <div className="mt-3 space-y-2 text-sm">
          <h3 className="font-semibold text-gray-800">Your Crawl:</h3>
          <ol className="list-decimal pl-5 space-y-1 max-h-40 overflow-y-auto">
            {route.map((stop: Venue, i: number) => (
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
              onClick={handleSaveToLocal}
              className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600 transition"
            >
              💾 Save
            </button>
            <button
              onClick={handleExportToMaps}
              className="w-full bg-green-500 text-white py-1 rounded hover:bg-green-600 transition"
            >
              🌍 Export to Maps
            </button>
            <button
              onClick={handleCopyLink}
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
