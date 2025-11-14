// utils/emoji.ts

// Mapping of common venue types to emojis
const typeEmojiMap: Record<string, string> = {
  bar: '🍸',
  cafe: '☕',
  restaurant: '🍽️',
  club: '🎉',
  gallery: '🖼️',
  park: '🌳',
  brewery: '🍺',
  wine: '🍷',
  food: '🍔',
  music: '🎶',
  lunch: '🥪',
  dinner: '🍽️',
  default: '📍',
}

/**
 * Returns an emoji based on the venue or stop type.
 * Falls back to a default pin emoji if type is unknown.
 */
export function getEmojiForType(type?: string | null): string {
  if (!type) return typeEmojiMap.default
  const lower = type.toLowerCase()
  return typeEmojiMap[lower] ?? typeEmojiMap.default
}
