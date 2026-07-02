import { timingSafeEqual } from "crypto"

export function safeCompareHashes(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex")
  const bufB = Buffer.from(b, "hex")

  if (bufA.length !== bufB.length) return false

  return timingSafeEqual(bufA, bufB)
}
