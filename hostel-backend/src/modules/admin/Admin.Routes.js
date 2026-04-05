import { Router } from "express";

import {
   addUser,
   deleteUser,
   updateRole,
   getUsers,
   createMonthlyFee,
   getMonthlyFees,
   getProfileRequests,
   updateProfileRequestStatus
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

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users with pagination and search (ADMIN only)
 *     tags: [Admin]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
router.get("/users", getUsers);

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
   PROFILE APPROVALS
============================== */

/**
 * @swagger
 * /api/admin/profile-requests:
 *   get:
 *     summary: Get pending family profile updates (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of pending requests
 */
router.get("/profile-requests", getProfileRequests);

/**
 * @swagger
 * /api/admin/profile-requests/{id}:
 *   patch:
 *     summary: Approve or reject profile request (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/profile-requests/:id", updateProfileRequestStatus);


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

/* ==============================
   MONTHLY FEE MANAGEMENT
============================== */

/**
 * @swagger
 * /api/admin/monthly-fees:
 *   post:
 *     summary: Create a monthly fee for a user (ADMIN only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, month, amount, dueDate]
 *             properties:
 *               userId:
 *                 type: string
 *               month:
 *                 type: string
 *                 description: "Format: YYYY-MM (e.g., 2026-03)"
 *               amount:
 *                 type: integer
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Monthly fee created
 */
router.post("/monthly-fees", createMonthlyFee);

/**
 * @swagger
 * /api/admin/monthly-fees:
 *   get:
 *     summary: Get all monthly fees with filters (ADMIN only)
 *     tags: [Admin]
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
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, OVERDUE]
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of monthly fees
 */
router.get("/monthly-fees", getMonthlyFees);

export default router;