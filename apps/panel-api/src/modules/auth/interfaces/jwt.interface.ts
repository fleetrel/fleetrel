import { RefreshTokenVersion } from "../constants"

export interface IJWTPayload {
  sub: string
  sid: string
  version?: RefreshTokenVersion
}

export interface ITokens {
  accessToken: string
  refreshToken: string
}
