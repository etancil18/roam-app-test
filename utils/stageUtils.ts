// utils/stageUtils.ts

/**
 * Defines stage groupings for sequential venue types throughout the day.
 */
export const STAGE_GROUPS: string[][] = [
  ["coffee", "bakery"],                              // 1
  ["fitness"],                                        // 2
  ["market", "breakfast", "brunch"],                 // 3
  ["park", "bookstore", "gallery"],                  // 4
  ["lifestyle", "random gem"],                       // 5
  ["lunch"],                                          // 6
  ["park", "bookstore", "gallery", "activity"],      // 7
  ["cocktail", "random gem"],                        // 8
  ["dinner"],                                         // 9
  ["bar", "cocktail", "speakeasy", "lounge"]         // 10
];

/**
 * Determines the sequence of stage groups based on current time.
 * Ensures the crawl starts at a relevant point in the day.
 */
export function sequencedStagesForNow(now: Date): string[][] {
  const h = now.getHours() + now.getMinutes() / 60;
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday

  let startIdx = 0;

  if (h >= 10.5 && h < 13) startIdx = 2;
  else if (h >= 13 && h < 16) startIdx = 4;
  else if (h >= 16 && h < 19) startIdx = 7;
  else if (h >= 19 && h < 22) startIdx = 8;
  else if (
    (day >= 4 && day <= 6 && h >= 22) || // Thu/Fri/Sat late night
    (day === 0 && h < 3) // Sunday early AM continuation
  ) {
    startIdx = 9;
  }

  return STAGE_GROUPS.slice(startIdx).concat(STAGE_GROUPS.slice(0, startIdx));
}

