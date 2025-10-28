import { NextRequest, NextResponse } from "next/server";
import { generateRoute } from "@/lib/routeEngine";
import type { Venue } from "@/types/venue";

export async function POST(req: NextRequest) {
  let body: any;

  try {
    body = await req.json();
  } catch (err) {
    console.warn("⚠️ Invalid JSON in request body:", err);
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  const { venues, options = {}, userLat, userLon } = body as {
    venues: Venue[];
    options?: Record<string, any>;
    userLat: number;
    userLon: number;
  };

  if (!Array.isArray(venues) || venues.length === 0) {
    return NextResponse.json({ error: "Venues must be a non-empty array." }, { status: 400 });
  }

  if (
    typeof userLat !== "number" || typeof userLon !== "number" ||
    isNaN(userLat) || isNaN(userLon)
  ) {
    return NextResponse.json({ error: "Invalid or missing user location." }, { status: 400 });
  }

  // ✅ Convert incoming startTime string → Date properly
  if (options.startTime) {
    options.startTime = new Date(options.startTime);
  }

  const customLat = options.customStart?.lat;
  const customLon = options.customStart?.lon;
  const customValid =
    typeof customLat === "number" &&
    typeof customLon === "number" &&
    !isNaN(customLat) &&
    !isNaN(customLon);

  const startLat = customValid ? customLat : userLat;
  const startLon = customValid ? customLon : userLon;

  if (customValid) {
    console.log("📍 Using custom start point:", startLat, startLon);
  }

  console.log("🧪 Route generation input:", {
    venueCount: venues.length,
    startLat,
    startLon,
    options: { ...options, customStart: undefined }, // Hide nested logging noise
  });

  try {
    const t0 = performance.now();
    const route = await generateRoute(venues, startLat, startLon, options);
    const duration = performance.now() - t0;

    console.log(`✅ Route generated in ${duration.toFixed(1)}ms with ${route.length} stops`);

    return NextResponse.json({ route });
  } catch (err) {
    console.error("❌ Route generation failed:", err);
    return NextResponse.json({ error: "Route generation failed." }, { status: 500 });
  }
}
