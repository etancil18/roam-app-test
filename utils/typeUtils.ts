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