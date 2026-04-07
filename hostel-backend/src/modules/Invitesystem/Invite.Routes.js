import { Router } from "express";

import {
  createInvite,
  validateInvite,
  registerWithInvite,
  getInvitesByHostel,
  getAllInvites,
  sendInviteEmail,
  deleteInvite
} from "../Invitesystem/Invite.controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import { rateLimiter } from "../../middleware/Ratelimiter.js";
import { validate } from "../../middleware/Validate.Middleware.js";
import { createInviteSchema, registerWithInviteSchema } from "./Invite.Schema.js";

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
router.post("/",
  rateLimiter({ window: 60 * 1000, limit: 3, message: "Too Many Invites Created wait for some seonds " }), protect, authorize("ADMIN", "SUPER_ADMIN"), validate(createInviteSchema), createInvite);

/**
 * @swagger
 * /api/invite/{id}:
 *   delete:
 *     summary: Delete an invite (ADMIN only)
 *     tags: [Invite]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite deleted
 */
router.delete("/:id", protect, authorize("ADMIN", "SUPER_ADMIN"), deleteInvite);

/**
 * @swagger
 * /api/invite/hostel/{hostelId}:
 *   get:
 *     summary: Get all invites for a specific hostel
 *     tags: [Invite]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: hostelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of invites
 */
router.get("/hostel/:hostelId", protect, authorize("ADMIN", "SUPER_ADMIN"), getInvitesByHostel);

/**
 * @swagger
 * /api/invite/all:
 *   get:
 *     summary: Get all global invites (SUPER_ADMIN only)
 *     tags: [Invite]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all invites
 */
router.get("/all", protect, authorize("SUPER_ADMIN"), getAllInvites);

/**
 * @swagger
 * /api/invite/email-share:
 *   post:
 *     summary: Send invitation email via Resend
 *     tags: [Invite]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, email, originUrl]
 *             properties:
 *               code:
 *                 type: string
 *               email:
 *                 type: string
 *               originUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent
 */
router.post("/email-share", protect, authorize("ADMIN", "SUPER_ADMIN"), sendInviteEmail);

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
  validate(registerWithInviteSchema),
  registerWithInvite
);

export default router;