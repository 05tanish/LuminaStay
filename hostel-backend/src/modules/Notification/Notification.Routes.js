import express from "express";
import {
    broadcastNotification,
    sendUserNotification,
    getUserNotifications,
    markNotificationRead,
    getUnreadNotifications,
} from "../Notification/Notification.Controller.js";
import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import { validate } from "../../middleware/Validate.Middleware.js";
import { broadcastSchema, sendUserNotificationSchema } from "./Notification.Schema.js";
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: System Notifications
 */

// admin
/**
 * @swagger
 * /api/notification/broadcast:
 *   post:
 *     summary: Broadcast a notification to all users (ADMIN only)
 *     tags: [Notification]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message]
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Broadcast sent
 */
router.post("/broadcast", protect, authorize("SUPER_ADMIN", "ADMIN"), validate(broadcastSchema), broadcastNotification);
/**
 * @swagger
 * /api/notification/user:
 *   post:
 *     summary: Send a notification to a specific user (ADMIN only)
 *     tags: [Notification]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, message]
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification sent
 */
router.post("/user", protect, authorize("SUPER_ADMIN", "ADMIN"), validate(sendUserNotificationSchema), sendUserNotification);

// user
/**
 * @swagger
 * /api/notification:
 *   get:
 *     summary: Get all notifications for current user
 *     tags: [Notification]
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
 *         description: List of notifications
 */
router.get("/", protect, getUserNotifications);
/**
 * @swagger
 * /api/notification/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notification]
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
 *         description: Marked as read
 */
router.patch("/:id/read", protect, markNotificationRead);
// Route to get unread notifications for the authenticated user
/**
 * @swagger
 * /api/notification/unread:
 *   get:
 *     summary: Get unread notifications for current user
 *     tags: [Notification]
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
 *         description: List of unread notifications
 */
router.get('/unread', protect, getUnreadNotifications);

export default router;