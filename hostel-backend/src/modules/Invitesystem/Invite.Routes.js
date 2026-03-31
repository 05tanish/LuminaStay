import { Router } from "express";

import {
  createInvite,
  validateInvite,
  registerWithInvite
} from "../Invitesystem/Invite.controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import { rateLimiter } from "../../middleware/Ratelimiter.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invite
 *   description: Registration Invitation System
 */

// Admin creates invite — protected + authorized
/**
 * @swagger
 * /api/invite:
 *   post:
 *     summary: Create an invite link for a specific role (ADMIN only)
 *     tags: [Invite]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role, hostelId]
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               hostelId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invite created
 */
router.post("/", protect, authorize("ADMIN"), createInvite);

// Public — validate invite code (read-only, lenient limit)
/**
 * @swagger
 * /api/invite/{code}:
 *   get:
 *     summary: Validate an invite code
 *     tags: [Invite]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite is valid
 *       400:
 *         description: Invalid or expired invite
 */
router.get("/:code", validateInvite);

// Public registration — 5 requests per 15 minutes.
// Why: prevents mass account creation via automated tools.
// IP-based since user isn't authenticated yet.
/**
 * @swagger
 * /api/invite/register:
 *   post:
 *     summary: Register a new user using an invite code
 *     tags: [Invite]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, email, password]
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register",
  rateLimiter({ window: 900, limit: 5, message: "Too many registration attempts. Please try again later." }),
  registerWithInvite
);

export default router;