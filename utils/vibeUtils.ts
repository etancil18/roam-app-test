export function vibesArray(input?: string): string[] {
  if (!input?.trim()) return [];
  return input
    .split(",")
    .map((v) => normalizeTag(v.trim()))
    .filter(Boolean);
}

export function normalizeTag(tag: string): string {
  const t = tag.toLowerCase();
  const synonymMap: Record<string, string> = {
    speakeasy: "cocktail",
    mixology: "cocktail",
    dive: "casual",
    pub: "casual",
    rooftop: "view",
    romantic: "date night",
    intimate: "date night",
    museum: "art",
    gallery: "art",
    streetwear: "fashion",
    karaoke: "music",
    live: "music",
  };
  return synonymMap[t] ?? t;
}

// ✅ RE-EXPORT in a bundler-safe way
function _vibeSimilarity(
  a: { vibe?: string; tags?: string },
  b: { vibe?: string; tags?: string }
): number {
  const aVibes = new Set([...vibesArray(a.vibe), ...vibesArray(a.tags)]);
  const bVibes = new Set([...vibesArray(b.vibe), ...vibesArray(b.tags)]);
  if (aVibes.size === 0 || bVibes.size === 0) return 0;

  let overlapCount = 0;
  aVibes.forEach((v) => {
    if (bVibes.has(v)) overlapCount++;
  });

  const maxLen = Math.max(aVibes.size, bVibes.size);
  return overlapCount / maxLen;
}

export { _vibeSimilarity as vibeSimilarity };
