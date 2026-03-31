import { Router } from "express";

import { getMe, getUserFees } from "./User.Controller.js";
import {
   getUserNotifications,
   markNotificationRead
} from "../Notification/Notification.Controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";

const router = Router();


router.use(protect);

/* ==============================
   USER PROFILE
============================== */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Profile and Account Management
 */

// get logged in user
/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current logged in user profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authenticated
 */
router.get("/me", getMe);


/* ==============================
   USER NOTIFICATIONS
============================== */

// get all notifications
/**
 * @swagger
 * /api/user/notifications:
 *   get:
 *     summary: Get all notifications for the current user
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page (default 20)
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/notifications", getUserNotifications);

// mark notification as read
/**
 * @swagger
 * /api/user/notifications/{id}/read:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification Recipient record ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.patch("/notifications/:id/read", markNotificationRead);

/* ==============================
   USER MONTHLY FEES
============================== */

/**
 * @swagger
 * /api/user/my-fees:
 *   get:
 *     summary: Get current user's monthly fees
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of monthly fees
 */
router.get("/my-fees", getUserFees);

export default router;