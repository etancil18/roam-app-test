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
}: {
  venues: Venue[];
  onRoute: (route: Venue[]) => void;
  durationTarget?: number;
}) {
  const [loading, setLoading] = useState(false);

  async function handleGenerateCrawl() {
    setLoading(true);
    try {
      const resp = await fetch("/api/generate-crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venues, options: { maxStops: 10, maxDuration: durationTarget } }),
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

  return (
    <div className="absolute bottom-4 left-4 z-[2000] bg-white p-2 rounded shadow w-64">
      <button
        onClick={handleGenerateCrawl}
        disabled={loading || venues.length === 0}
        className="w-full px-3 py-1 bg-blue-600 text-white rounded"
      >
        {loading ? "Generating…" : "Generate Crawl"}
      </button>
    </div>
  );
}

export default function MapWrapper() {
  const [city, setCity] = useState<'atl' | 'nyc'>('atl');
  const [route, setRoute] = useState<Venue[] | undefined>(undefined);

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
      {/* City toggle */}
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

        {/* Theme dropdown */}
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

        {/* Neighborhood dropdown */}
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

        {/* Price dropdown */}
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

        {/* Duration dropdown */}
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
      />
      <Suspense fallback={<div className="text-center p-4">Loading map…</div>}>
        <MapCanvas venues={filteredVenues} route={route} city={city} />
      </Suspense>
    </main>
  );
}
