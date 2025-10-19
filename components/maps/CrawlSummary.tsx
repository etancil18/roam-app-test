import { useEffect, useState } from "react";
import { Venue } from "@/types/venue";

interface CrawlSummaryProps {
  route: Venue[];
  onClose: () => void;
}

export default function CrawlSummary({ route, onClose }: CrawlSummaryProps) {
  const [copied, setCopied] = useState(false);

  function handleSave() {
    if (route.length < 2) return alert("Need at least 2 stops to save");
    const existing = localStorage.getItem("savedRoutes");
    const routes = existing ? JSON.parse(existing) : [];
    routes.push([...route]);
    localStorage.setItem("savedRoutes", JSON.stringify(routes));
    alert("Saved to favorites (local only for now)");
  }

  function handleExport() {
    const base = "https://www.google.com/maps/dir/";
    const waypoints = route.map((r) => `${r.lat},${r.lon}`).join("/");
    window.open(`${base}${waypoints}`, "_blank");
  }

  function handleCopy() {
    const ids = route.map((r) => (r.id ?? r.name)).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("route", ids);
    navigator.clipboard.writeText(url.toString()).then(() => setCopied(true));
  }

  useEffect(() => {
    if (copied) setTimeout(() => setCopied(false), 2000);
  }, [copied]);

  return (
    <aside className="absolute right-4 top-16 z-[2000] bg-white shadow-lg rounded-lg w-72 p-4 space-y-3">
      <h2 className="text-lg font-bold">Your Crawl</h2>
      <ol className="list-decimal pl-4 text-sm">
        {route.map((stop, i) => (
          <li key={i}>
            <a
              href={stop.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {stop.name}
            </a>
          </li>
        ))}
      </ol>
      <div className="space-y-2 text-sm">
        <button onClick={handleSave} className="w-full bg-blue-500 text-white py-1 rounded">
          💾 Save
        </button>
        <button onClick={handleExport} className="w-full bg-green-500 text-white py-1 rounded">
          🌍 Export to Maps
        </button>
        <button onClick={handleCopy} className="w-full bg-gray-700 text-white py-1 rounded">
          🔗 {copied ? "Copied!" : "Copy Link"}
        </button>
        <button onClick={onClose} className="w-full bg-red-500 text-white py-1 rounded">
          ✖ Close
        </button>
      </div>
    </aside>
  );
}
