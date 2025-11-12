'use client';

import { useState } from 'react';
import type { Venue } from '@/types/venue';
import { themeById } from '@/lib/crawlConfig';
import { findSimilarVenuesNearby } from '@/utils/findSimilarVenues';
import { useFavorites } from '@/hooks/useFavorites';


export type CrawlControlProps = {
  venues: Venue[];
  route?: Venue[];
  onRoute: (route: Venue[]) => void;
  selectedThemeId: string;
  customStart?: { lat: number; lon: number } | null;
  city: 'atl' | 'nyc';
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
  const [modalData, setModalData] = useState<{
    target: Venue | null;
    options: Venue[];
    index: number | null;
  }>({ target: null, options: [], index: null });
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const { favorites, loading: loadingFavorites } = useFavorites();



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
      alert('Need at least 2 stops to save.');
      return;
    }

    const name = prompt('Name this crawl?');
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
    } catch (err) {
      console.error(err);
      alert('❌ Error saving route.');
    }
  }

  function handleExportToMaps() {
    if (!Array.isArray(route) || route.length < 2) return;
    const base = 'https://www.google.com/maps/dir/';
    const waypoints = route.map((v) => `${v.lat},${v.lon}`).join('/');
    window.open(`${base}${waypoints}`, '_blank');
  }

  function handleInsertFavoriteAt(newVenue: Venue, index: number) {
  if (!route) return;
  if (route.find((r) => r.id === newVenue.id)) {
    alert('This venue is already in your crawl.');
    return;
  }

  const updated = [...route.slice(0, index), newVenue, ...route.slice(index)];
  onRoute(updated);
  setShowFavoritesModal(false);
}

  function handleCopyLink() {
    if (!Array.isArray(route) || route.length === 0) return;
    const ids = route.map((v) => v.id ?? v.name).join(',');
    const url = new URL(window.location.href);
    url.searchParams.set('route', ids);

    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleClear() {
    onRoute([]);
    const url = new URL(window.location.href);
    url.searchParams.delete('route');
    window.history.replaceState(null, '', url.toString());
    setCopied(false);
  }

  function handleModifyStop(stop: Venue, index: number) {
    const similar = findSimilarVenuesNearby(venues, stop, 3);
    setModalData({ target: stop, options: similar, index });
  }

  function handleReplaceStop(newVenue: Venue, index: number) {
    if (!route) return;
    const updated = [...route];
    updated[index] = newVenue;
    onRoute(updated);
    setModalData({ target: null, options: [], index: null });
  }

  function handleRemoveStop(index: number) {
    if (!route) return;
    const updated = route.filter((_, i) => i !== index);
    onRoute(updated);
    setModalData({ target: null, options: [], index: null });
  }

  const themeName = selectedThemeId ? themeById[selectedThemeId]?.name : null;

  return (
  <div className="absolute bottom-4 left-4 z-[2000] bg-white p-3 rounded-xl shadow-lg w-72 border border-gray-300">
    
    {/* Generate Button */}
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
        
        {/* Crawl List */}
        <h3 className="font-semibold text-gray-800">Your Crawl:</h3>
        <ol className="list-decimal pl-5 space-y-1 max-h-40 overflow-y-auto">
          {route.map((stop, i) => (
            <li key={i} className="flex items-center justify-between">
              <a
                href={stop.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {stop.name}
              </a>

              {/* Remove/Modify Button */}
              <button
                onClick={() => handleModifyStop(stop, i)}
                className="text-red-500 text-xs hover:text-red-700 ml-2"
              >
                ❌
              </button>
            </li>
          ))}
        </ol>

        {/* Action Buttons */}
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

          {/* Add From Favorites */}
          <button
            onClick={() => setShowFavoritesModal(true)}
            className="w-full bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600 transition"
          >
            ➕ Add from Favorites
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

    {/* Replace/Remove Modal */}
    {modalData.target && (
      <div className="absolute bottom-24 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-72 z-[2100]">
        <p className="font-semibold mb-2 text-gray-800">
          Modify stop: {modalData.target.name}
        </p>

        {modalData.options.length > 0 ? (
          <>
            <p className="text-sm text-gray-600 mb-1">Replace with similar:</p>
            <ul className="space-y-1 mb-2">
              {modalData.options.map((opt, idx) => (
                <li key={idx}>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleReplaceStop(opt, modalData.index!)}
                  >
                    {opt.name}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-gray-500 mb-2 italic">
            No similar locations found nearby.
          </p>
        )}

        <button
          className="bg-red-500 text-white w-full py-1 rounded hover:bg-red-600 mb-2"
          onClick={() => handleRemoveStop(modalData.index!)}
        >
          Remove Stop
        </button>

        <button
          className="w-full py-1 rounded border border-gray-400 hover:bg-gray-50"
          onClick={() => setModalData({ target: null, options: [], index: null })}
        >
          Cancel
        </button>
      </div>
    )}

    {/* ADD FROM FAVORITES — Base Modal (Step 2 Scaffold) */}
    {showFavoritesModal && (
  <div className="absolute bottom-24 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-72 z-[2100] overflow-y-auto max-h-[70vh]">
    <p className="font-semibold mb-2 text-gray-800">Add stop from favorites</p>

    {loadingFavorites ? (
      <p className="text-sm text-gray-500">Loading favorites…</p>
    ) : favorites.length === 0 ? (
      <p className="text-sm text-gray-500 italic">No favorites found.</p>
    ) : (
      <ul className="space-y-4">
        {favorites.map((fav, fIdx) => (
          <li key={fIdx} className="border border-gray-200 rounded p-2">
            <p className="font-semibold text-sm text-gray-800">{fav.name}</p>
            {route && route.length > 0 ? (
              <div className="space-y-1 mt-2">
                {route.map((stop, i) => (
                  <div key={i} className="flex gap-2">
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => handleInsertFavoriteAt(fav, i)}
                    >
                      ➕ Before {stop.name}
                    </button>
                    <button
                      className="text-xs text-green-600 hover:underline"
                      onClick={() => handleInsertFavoriteAt(fav, i + 1)}
                    >
                      ➕ After {stop.name}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1 italic">
                No crawl generated yet.
              </p>
            )}
          </li>
        ))}
      </ul>
    )}

    <button
      className="w-full py-1 mt-4 rounded border border-gray-400 hover:bg-gray-50"
      onClick={() => setShowFavoritesModal(false)}
    >
      Cancel
    </button>
  </div>
)}


  </div>
);
}
