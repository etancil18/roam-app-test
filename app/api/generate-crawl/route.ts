import { NextRequest, NextResponse } from 'next/server';
import { generateRoute } from '@/lib/routeEngine';
import { Venue } from '@/types/venue';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { venues, options } = body as { venues: Venue[]; options?: any };

  if (!venues || !Array.isArray(venues)) {
    return NextResponse.json({ error: 'Invalid venues' }, { status: 400 });
  }

  try {
    const route = generateRoute(venues, options);
    return NextResponse.json({ route });
  } catch (err) {
    console.error('Route generation error:', err);
    return NextResponse.json({ error: 'Could not generate route' }, { status: 500 });
  }
}
