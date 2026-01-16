import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.js'

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}
