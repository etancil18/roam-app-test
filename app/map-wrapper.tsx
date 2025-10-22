'use client';

import dynamic from "next/dynamic";
import { Suspense, useState, useMemo } from "react";
import atlantaData from "@/data/atlanta";
import nycData from "@/data/nyc";
import { Venue } from "@/types/venue";

const MapCanvas = dynamic(() => import("@/components/maps/MapCanvas"), {
  ssr: false,
});

function normalize(data: any[]): Venue[] {
  return data.map((d) => ({
    ...d,
    lat: typeof d.lat === "string" ? parseFloat(d.lat) : d.lat,
    lon: typeof d.lon === "string" ? parseFloat(d.lon) : d.lon,
    neighborhood: (d as any).neighborhood ?? "",
    price: (d as any).price ?? "",
    tags: (d as any).tags ?? "",
  })) as Venue[];
}

function CrawlControl({
  venues,
  onRoute,
  durationTarget,
  selectedTheme,
  userLat,
  userLon,
  setUserLat,
  setUserLon,
  route,
}: {
  venues: Venue[];
  onRoute: (route: Venue[]) => void;
  durationTarget?: number;
  selectedTheme: string;
  userLat: number | null;
  userLon: number | null;
  setUserLat: (lat: number | null) => void;
  setUserLon: (lon: number | null) => void;
  route: Venue[] | undefined;
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerateCrawl() {
    if (userLat == null || userLon == null) {
      alert("Please enable location or drop a pin on the map to begin.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/generate-crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venues,
          userLat,
          userLon,
          options: {
            maxStops: 10,
            maxDuration: durationTarget,
            theme: selectedTheme.trim().toLowerCase(),
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
    setUserLat(null);
    setUserLon(null);
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

export default function MapWrapper() {
  const [city, setCity] = useState<'atl' | 'nyc'>('atl');
  const [route, setRoute] = useState<Venue[] | undefined>(undefined);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [durationTarget, setDurationTarget] = useState<number | undefined>(undefined);

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

      const neighOk =
        selectedNeighborhood === "" ||
        v.neighborhood === selectedNeighborhood;

      const priceOk =
        selectedPrice === "" || v.price === selectedPrice;

      return searchOk && themeOk && neighOk && priceOk;
    });
  }, [allVenues, searchTerm, selectedTheme, selectedNeighborhood, selectedPrice]);

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

      {/* Filter UI */}
      <div className="absolute top-16 left-4 z-[3000] bg-white rounded-lg shadow p-3 space-y-2 w-64 border border-gray-400">
        <h2 className="text-sm font-semibold text-black">Filters</h2>

        <input
          type="text"
          placeholder="What's the vibe…"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setRoute(undefined);
          }}
          className="w-full px-2 py-1 border rounded"
        />

        <select
          value={selectedTheme}
          onChange={(e) => {
            setSelectedTheme(e.target.value);
            setRoute(undefined);
          }}
          className="w-full px-2 py-1 border rounded"
        >
          <option value="">Select Theme</option>
          <option value="art & culture">Art & Culture</option>
          <option value="art to afterparty">Art to Afterparty</option>
          <option value="brunch & beyond">Brunch & Beyond</option>
          <option value="cheap & cheerful">Cheap & Cheerful</option>
          <option value="chill hang">Chill Hang</option>
          <option value="creative kickstart">Creative Kickstart</option>
          <option value="date day">Date Day</option>
          <option value="date night">Date Night</option>
          <option value="foodie tour">Foodie Tour</option>
          <option value="friends night out">Friends Night Out</option>
          <option value="gallery crawl">Gallery Crawl</option>
          <option value="health nut">Health Nut</option>
          <option value="hidden gems">Hidden Gems</option>
          <option value="last call">Last Call</option>
          <option value="late start legends">Late Start Legends</option>
          <option value="luxe life">Luxe Life</option>
          <option value="midday recharge">Midday Recharge</option>
          <option value="mindful mornings">Mindful Mornings</option>
          <option value="music mile">Music Mile</option>
          <option value="neighborhood sampler">Neighborhood Sampler</option>
          <option value="nightcap circuit">Nightcap Circuit</option>
          <option value="pages to pours">Pages to Pours</option>
          <option value="party time">Party Time</option>
          <option value="patio perfection">Patio Perfection</option>
          <option value="post-work wind down">Post-Work Wind Down</option>
          <option value="quiet escape">Quiet Escape</option>
          <option value="rom-com main character">Rom-Com Main Character</option>
          <option value="rooftops & views">Rooftops & Views</option>
          <option value="saturday surge">Saturday Surge</option>
          <option value="self-care">Self-Care</option>
          <option value="solo explorer">Solo Explorer</option>
          <option value="sports day">Sports Day</option>
          <option value="stretch, shop, sip">Stretch, Shop, Sip</option>
          <option value="sunrise start">Sunrise Start</option>
          <option value="sunset lovers">Sunset Lovers</option>
          <option value="sunday reset">Sunday Reset</option>
          <option value="tech bro escape">Tech Bro Escape</option>
          <option value="weekend warriors">Weekend Warriors</option>
          <option value="work session">Work Session</option>
        </select>

        <select
          value={selectedNeighborhood}
          onChange={(e) => {
            setSelectedNeighborhood(e.target.value);
            setRoute(undefined);
          }}
          className="w-full px-2 py-1 border rounded"
        >
          <option value="">Neighborhood</option>
          <option value="Buckhead">Buckhead</option>
          <option value="Midtown">Midtown</option>
          <option value="Eastside">Eastside</option>
        </select>

        <select
          value={selectedPrice}
          onChange={(e) => {
            setSelectedPrice(e.target.value);
            setRoute(undefined);
          }}
          className="w-full px-2 py-1 border rounded"
        >
          <option value="">Any Price</option>
          <option value="$">$</option>
          <option value="$$">$$</option>
          <option value="$$$">$$$</option>
        </select>

        <select
          value={durationTarget ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setDurationTarget(val === "" ? undefined : parseFloat(val));
            setRoute(undefined);
          }}
          className="w-full px-2 py-1 border rounded"
        >
          <option value="">How Long?</option>
          <option value="1">1 hr</option>
          <option value="2">2 hrs</option>
          <option value="3">3 hrs</option>
          <option value="4">4 hrs</option>
        </select>
      </div>

      <CrawlControl
        venues={filteredVenues}
        onRoute={setRoute}
        durationTarget={durationTarget}
        selectedTheme={selectedTheme}
        userLat={userLat}
        userLon={userLon}
        setUserLat={setUserLat}
        setUserLon={setUserLon}
        route={route}
      />

      <Suspense fallback={<div className="text-center p-4">Loading map…</div>}>
        <MapCanvas
          venues={filteredVenues}
          route={route}
          city={city}
          onMapClick={(lat, lon) => {
            setUserLat(lat);
            setUserLon(lon);
            alert("Starting point set — you can now generate your crawl.");
          }}
        />
      </Suspense>
    </main>
  );
}