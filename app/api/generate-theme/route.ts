import { NextRequest, NextResponse } from "next/server";
import { themeById } from "@/lib/crawlConfig";
import { generateThemeRoute } from "@/lib/theme-engine";
import type { Venue } from "@/types/venue";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { themeId, venues, userLat, userLon, options = {} } = body as {
      themeId: string;
      venues: Venue[];
      userLat: number;
      userLon: number;
      options?: Record<string, any>;
    };

    // Validate theme
    if (!themeId || typeof themeId !== "string") {
      return NextResponse.json({ error: "Missing or invalid themeId" }, { status: 400 });
    }

    const theme = themeById[themeId];
    if (!theme) {
      return NextResponse.json({ error: `Theme not found: ${themeId}` }, { status: 404 });
    }

    // Validate venues
    if (!Array.isArray(venues) || venues.length === 0) {
      return NextResponse.json({ error: "Venues must be a non-empty array." }, { status: 400 });
    }

    // Validate location
    if (
      typeof userLat !== "number" || typeof userLon !== "number" ||
      isNaN(userLat) || isNaN(userLon)
    ) {
      return NextResponse.json({ error: "Invalid or missing user location." }, { status: 400 });
    }

    // Normalize time and fallback location
    const startTime = options.startTime ? new Date(options.startTime) : new Date();
    const customLat = options.customStart?.lat;
    const customLon = options.customStart?.lon;
    const originLat = typeof customLat === "number" && !isNaN(customLat) ? customLat : userLat;
    const originLon = typeof customLon === "number" && !isNaN(customLon) ? customLon : userLon;

    console.log("🎨 Theme-based route input:", {
      theme: theme.name,
      startLat: originLat,
      startLon: originLon,
      totalVenues: venues.length,
      options,
    });

    console.log("📦 generateThemeRoute type:", typeof generateThemeRoute);

    // Attempt strict generation first
    const route = await generateThemeRoute({
      themeId,
      venues,
      userLat: originLat,
      userLon: originLon,
      maxStops: options.maxStops ?? 6,
      filterOpen: options.filterOpen ?? true,
    });

    if (!route || !Array.isArray(route) || route.length === 0) {
      console.warn("⚠️ Strict route generation failed. Trying relaxed fallback...");

      // Relaxed fallback
      const relaxedRoute = await generateThemeRoute({
        themeId,
        venues,
        userLat: originLat,
        userLon: originLon,
        maxStops: options.maxStops ?? 6,
        filterOpen: false, // allow closed venues for fallback
      });

      if (!relaxedRoute || relaxedRoute.length === 0) {
        return NextResponse.json(
          { error: "No valid route could be generated, even with relaxed criteria." },
          { status: 422 }
        );
      }

      console.log(`✅ Fallback route generated with ${relaxedRoute.length} stops`);
      return NextResponse.json({ route: relaxedRoute, fallbackUsed: true });
    }

    console.log(`✅ Theme route generated with ${route.length} stops`);
    return NextResponse.json({ route, fallbackUsed: false });

  } catch (err) {
    console.error("❌ Theme route generation failed:", err);
    return NextResponse.json(
      {
        error: "Route generation failed.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
