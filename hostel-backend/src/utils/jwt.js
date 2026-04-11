import jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/env.js'

// Access token — short-lived (15 min)
// Used for authenticating API requests. Short expiry limits damage if token is stolen.
export const signAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15' })
}

// Refresh token — long-lived (7 days)
// Used ONLY to obtain new access tokens. Stored in Redis for instant revocation.
// Uses a separate secret so access tokens can't be used as refresh tokens and vice versa.
export const signRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET)
}

// Keep backward-compatible aliases
export const signToken = signAccessToken
export const verifyToken = verifyAccessToken
