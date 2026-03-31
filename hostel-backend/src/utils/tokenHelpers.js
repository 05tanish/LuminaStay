// Token helper utilities — centralizes cookie management and refresh token storage.
// All login flows (email, Google, invite) use these helpers for consistent behavior.

import { signAccessToken, signRefreshToken } from './jwt.js'
import { redis } from '../config/redis.js'
import { IS_PRODUCTION } from '../config/env.js'

// Cookie configuration constants
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000          // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days
const REFRESH_TOKEN_REDIS_TTL = 7 * 24 * 60 * 60       // 7 days in seconds

// Common cookie options — httpOnly prevents XSS, secure prevents MITM in production
const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? 'strict' : 'lax',
  maxAge
})

/**
 * Sets access + refresh token cookies and stores refresh token in Redis.
 * Called after every successful login (email, Google, invite).
 *
 * Why Redis for refresh tokens?
 * - Instant revocation on logout (delete the key)
 * - Token rotation (old token invalidated immediately)
 * - No DB queries needed for token validation
 */
export const setAuthCookies = async (res, user) => {
  const payload = { id: user.id, role: user.role }

  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  // Store refresh token in Redis with TTL matching token expiry.
  // Key format: refresh:<userId> — one active refresh token per user.
  // If user logs in from another device, old session is implicitly revoked.
  await redis.set(
    `refresh:${user.id}`,
    refreshToken,
    'EX',
    REFRESH_TOKEN_REDIS_TTL
  )

  res.cookie('accessToken', accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE))
  res.cookie('refreshToken', refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE))

  return { accessToken, refreshToken }
}

/**
 * Clears auth cookies and removes refresh token from Redis.
 * Called on explicit logout. Ensures instant session invalidation —
 * even if the refresh token cookie somehow persists, Redis will reject it.
 */
export const clearAuthCookies = async (res, userId) => {
  // Remove refresh token from Redis — prevents reuse even if cookie is retained
  await redis.del(`refresh:${userId}`)

  res.cookie('accessToken', '', { httpOnly: true, secure: IS_PRODUCTION, expires: new Date(0) })
  res.cookie('refreshToken', '', { httpOnly: true, secure: IS_PRODUCTION, expires: new Date(0) })
}
