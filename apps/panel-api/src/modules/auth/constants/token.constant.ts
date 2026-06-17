/**
 * Marker claim embedded into refresh tokens. Together with the dedicated refresh
 * secret it lets us reject an access token that is replayed at the refresh endpoint.
 */
export const REFRESH_TOKEN_VERSION = "v2"

export type RefreshTokenVersion = typeof REFRESH_TOKEN_VERSION
