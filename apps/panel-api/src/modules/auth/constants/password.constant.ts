/** Minimum length enforced on raw passwords at the auth boundary (sign-in / sign-up). */
export const PASSWORD_MIN_LENGTH = 6

/**
 * Maximum length enforced on raw passwords before hashing. Argon2 has no
 * inherent byte limit, but unbounded input lets an attacker pin a CPU core for
 * seconds per request with a multi-MB payload.
 */
export const PASSWORD_MAX_LENGTH = 256
