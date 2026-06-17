const DURATION_UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
}

/**
 * Converts a short duration string (e.g. "10m", "30d", "2h", "45s") into
 * milliseconds. Used to keep cookie `maxAge` in sync with the JWT TTL so a
 * single env value drives both the token and its cookie lifetime.
 */
export function parseDuration(value: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim())
  if (!match) {
    throw new Error(`Invalid duration format: "${value}". Expected e.g. "10m", "30d".`)
  }

  const [, amount, unit] = match
  return Number(amount) * DURATION_UNIT_MS[unit]
}
