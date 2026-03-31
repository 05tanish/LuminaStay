import { Router } from "express";

import {
   addUser,
   deleteUser,
   updateRole,
} from "./Admin.Controller.js";
import { broadcastNotification, sendUserNotification } from "../Notification/Notification.Controller.js";
import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";

const router = Router();


router.use(protect);
router.use(authorize("ADMIN"));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administration and User Management
 */

/* ==============================
   USER MANAGEMENT
============================== */

// Create new user
/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user account (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [STUDENT, ADMIN]
 *     responses:
 *       201:
 *         description: User created
 */
router.post("/users", addUser);

// Delete user
/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user account (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete("/users/:userId", deleteUser);

// Update user role
/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   patch:
 *     summary: Update a user's role (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [STUDENT, ADMIN]
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch("/users/:userId/role", updateRole);


/* ==============================
   NOTIFICATION MANAGEMENT
============================== */

// Broadcast notification to all users
/**
 * @swagger
 * /api/admin/notifications/broadcast:
 *   post:
 *     summary: Broadcast a notification (ADMIN only)
 *     tags: [Admin]
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
 *       200:
 *         description: Broadcast sent
 */
router.post("/notifications/broadcast", broadcastNotification);

// Send notification to specific user
/**
 * @swagger
 * /api/admin/notifications/user:
 *   post:
 *     summary: Send notification to a specific user (ADMIN only)
 *     tags: [Admin]
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
 *       200:
 *         description: Notification sent
 */
router.post("/notifications/user", sendUserNotification);

export default router;