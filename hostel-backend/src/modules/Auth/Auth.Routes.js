import { Router } from 'express'
import { login, logout, register } from './Auth.Controller.js'
import { googleLogin, googleRegister } from './GoogleAuth.Controller.js'
import { refreshTokens } from './Refresh.Controller.js'
import { sendOtp, verifyOtp } from './Otp.Controller.js'
import { rateLimiter } from '../../middleware/Ratelimiter.js'
import { protect } from '../../middleware/Authentification.Middleware.js'
import { validate } from '../../middleware/Validate.Middleware.js'
import { registerSchema, loginSchema, googleLoginSchema, googleRegisterSchema, sendOtpSchema, verifyOtpSchema } from './Auth.Schema.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Token Management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user with or without an invite code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password, otp]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               otp:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successful registration
 *       400:
 *         description: Invalid input or OTP
 */
router.post('/register',
  rateLimiter({ window: 900, limit: 10, message: "Too many registration attempts. Please try again later." }),
  validate(registerSchema),
  register
)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login, returns user info and sets cookies
 *       401:
 *         description: Invalid credentials
 */
// Login — 10 requests per 15 minutes per IP.
// Why 10/15min: allows legitimate users to retry typos while blocking
// automated brute-force attacks. IP-based since user isn't authenticated yet.
router.post('/login',
  rateLimiter({ window: 900, limit: 10, message: "Too many login attempts. Please try again in 15 minutes." }),
  validate(loginSchema),
  login
)

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Login with Google OAuth token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       403:
 *         description: User not allowed
 */
// Google OAuth — same limits as login since it's also an authentication endpoint
router.post('/google',
  rateLimiter({ window: 900, limit: 10, message: "Too many login attempts. Please try again in 15 minutes." }),
  validate(googleLoginSchema),
  googleLogin
)

// Google Register — email verified by Google, only invite code + name + phone needed
router.post('/google-register',
  rateLimiter({ window: 900, limit: 10, message: "Too many registration attempts. Please try again later." }),
  validate(googleRegisterSchema),
  googleRegister
)

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Get a new access token using a refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
// Refresh — 30 requests per 15 minutes.
// Higher limit because the frontend may auto-refresh before every API call.
// Still rate-limited to prevent refresh token brute-force attacks.
router.post('/refresh',
  rateLimiter({ window: 900, limit: 30, message: "Too many refresh attempts. Please login again." }),
  refreshTokens
)

/**
 * @swagger
 * /api/auth/otp/send:
 *   post:
 *     summary: Send OTP to verify phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 *       429:
 *         description: Cooldown active
 */
// OTP send — 3 requests per 5 minutes.
// Why so strict: each OTP costs money (MSG91 API), and the OTP service
// already has its own 60-second cooldown. This catches abuse beyond that.
router.post('/otp/send',
  rateLimiter({ window: 300, limit: 3, message: "Too many OTP requests. Please wait 5 minutes." }),
  validate(sendOtpSchema),
  sendOtp
)

/**
 * @swagger
 * /api/auth/otp/verify:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post('/otp/verify',
  rateLimiter({ window: 300, limit: 15, message: "Too many verification attempts." }),
  validate(verifyOtpSchema),
  verifyOtp
)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and clear tokens
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
// Logout — requires authentication to know which user's refresh token to invalidate
router.post('/logout', protect, logout)

export const authRouter = router
