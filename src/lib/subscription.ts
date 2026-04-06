export const FREE_LIMITS = {
  maxItems: 50,
  maxCollections: 3,
} as const

export const PRO_ONLY_TYPES = ["file", "image"] as const

export function isProOnlyType(typeName: string): boolean {
  return (PRO_ONLY_TYPES as readonly string[]).includes(typeName)
}
