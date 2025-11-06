// utils/typeUtils.ts

export function hasType(loc: any, desired: string[]): boolean {
  const types = Array.isArray(loc.type)
    ? loc.type.map((t: string) => t.toLowerCase())
    : String(loc.type || '').split(',').map((s) => s.trim().toLowerCase());
  return types.some((t: string) => desired.includes(t));
}

export function isMealType(loc: any): boolean {
  const meals = ["breakfast", "brunch", "lunch", "dinner"];
  const types = Array.isArray(loc.type)
    ? loc.type.map((t: string) => t.toLowerCase())
    : String(loc.type || '').split(',').map((s) => s.trim().toLowerCase());
  return types.some((t: string) => meals.includes(t));
}

function hasVibeOrTagMatch(loc: any, keywords: string[]): boolean {
  const vibe = (loc.vibe || '').toLowerCase();
  const tags = (loc.tags || '').toLowerCase();
  return keywords.some((kw) => vibe.includes(kw) || tags.includes(kw));
}

function matchesThemeFilters(loc: any, filters: {
  vibes?: string[];
  tags?: string[];
  price?: number[];
  timeOfDay?: string[];
}): boolean {
  if (filters.vibes) {
    const vibe = (loc.vibe || '').toLowerCase();
    if (!filters.vibes.some(v => vibe.includes(v))) return false;
  }

  if (filters.tags) {
    const tags = (loc.tags || '').toLowerCase();
    if (!filters.tags.some(t => tags.includes(t))) return false;
  }

  if (filters.price) {
    const priceSymbol = (loc.price || '').trim();
    const priceVal = priceSymbol.length;
    if (!filters.price.includes(priceVal)) return false;
  }

  if (filters.timeOfDay && loc.timeCategory) {
    const locTime = loc.timeCategory.toLowerCase();
    if (!filters.timeOfDay.includes(locTime)) return false;
  }

  return true;
}

export { matchesThemeFilters};
export { hasVibeOrTagMatch }
