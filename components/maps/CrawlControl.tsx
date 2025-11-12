'use client';

import { useState } from "react";
import type { Venue } from "@/types/venue";
import { themeById } from "@/lib/crawlConfig";

type CrawlControlProps = {
  venues: Venue[];
  route?: Venue[];
  onRoute: (route: Venue[]) => void;
  selectedThemeId: string;
  customStart?: { lat: number; lon: number } | null;
  city: "atl" | "nyc";
  onGenerateRoute: () => Promise<void>;
};

export default function CrawlControl({
  venues,
  route,
  onRoute,
  selectedThemeId,
  customStart,
  city,
  onGenerateRoute,
}: CrawlControlProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      await onGenerateRoute();
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToCloud() {
    if (!Array.isArray(route) || route.length < 2) {
      alert("Need at least 2 stops to save.");
      return;
    }

    const name = prompt("Name this crawl?");
    if (!name) return;

    try {
      const res = await fetch('/api/routes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          stops: route,
          city,
        }),
      });

      if (!res.ok) throw new Error('Failed to save route.');

      alert('✅ Saved to your account!');
      // Optional: trigger SWR or context refresh here if needed
    } catch (err) {
      console.error(err);
      alert('❌ Error saving route.');
    }
  }

  function handleExportToMaps() {
    if (!Array.isArray(route) || route.length < 2) return;
    const base = "https://www.google.com/maps/dir/";
    const waypoints = route.map((v) => `${v.lat},${v.lon}`).join("/");
    window.open(`${base}${waypoints}`, "_blank");
  }

  function handleCopyLink() {
    if (!Array.isArray(route) || route.length === 0) return;
    const ids = route.map((v) => v.id ?? v.name).join(",");
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

  const themeName = selectedThemeId ? themeById[selectedThemeId]?.name : null;

  return (
    <div className="absolute bottom-4 left-4 z-[2000] bg-white p-3 rounded-xl shadow-lg w-72 border border-gray-300">
      <button
        onClick={handleGenerate}
        disabled={loading || venues.length === 0}
        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        {loading ? "Generating…" : "Generate Crawl"}
      </button>

      {themeName && (
        <p className="text-xs text-gray-600 mt-1 italic text-center">
          Theme: {themeName}
        </p>
      )}

      {Array.isArray(route) && route.length > 0 && (
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
              onClick={handleSaveToCloud}
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

export type { CrawlControlProps };
