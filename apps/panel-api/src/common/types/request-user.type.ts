/**
 * Authenticated principal attached to `request.user` by the JWT strategy
 * after a successful access-token verification.
 */
export interface IRequestUser {
  userId: string
  sessionId: string
}
