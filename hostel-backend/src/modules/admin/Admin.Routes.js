import { Router } from "express";

import {
   addUser,
   deleteUser,
   hardDeleteUser,
   getSingleUser,
   updateRole,
   getUsers,
   createMonthlyFee,
   getMonthlyFees,
   getProfileRequests,
   updateProfileRequestStatus
} from "./Admin.Controller.js";
import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import { validate } from "../../middleware/Validate.Middleware.js";
import { addUserSchema, updateRoleSchema, createMonthlyFeeSchema, updateProfileRequestSchema } from "./Admin.Schema.js";

const router = Router();

router.use(protect);
// Allow both ADMIN and SUPER_ADMIN on all admin routes
router.use(authorize("ADMIN", "SUPER_ADMIN"));

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
router.post("/users", validate(addUserSchema), addUser);
router.get("/users/:userId", getSingleUser);
router.delete("/users/:userId/hard", hardDeleteUser);
router.delete("/users/:userId", deleteUser);
router.patch("/users/:userId/role", validate(updateRoleSchema), updateRole);


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
router.patch("/profile-requests/:id", validate(updateProfileRequestSchema), updateProfileRequestStatus);


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
router.post("/monthly-fees", validate(createMonthlyFeeSchema), createMonthlyFee);

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

export const adminRouter = router;