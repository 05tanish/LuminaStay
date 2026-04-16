import { Router } from "express";

import {
  createHostel,
  assignAdmin,
  getPlatformStats,
  getAllAdmins,
  reassignAdmin,
  removeAdmin
} from "./Superadmin.Controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import { validate } from "../../middleware/Validate.Middleware.js";
import { createHostelSchema, assignAdminSchema, reassignAdminSchema } from "./SuperAdmin.Schema.js";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: SuperAdmin
 *   description: Super Administration Endpoints
 */

/**
 * @swagger
 * /api/super-admin/stats:
 *   get:
 *     summary: Get platform-wide statistics (SUPER_ADMIN only)
 *     tags: [SuperAdmin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Platform stats retrieved
 */
router.get("/stats", protect, authorize("SUPER_ADMIN"), getPlatformStats);

/**
 * @swagger
 * /api/super-admin/admins:
 *   get:
 *     summary: List all admin users across the platform (SUPER_ADMIN only)
 *     tags: [SuperAdmin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all admins
 */
router.get("/admins", protect, authorize("SUPER_ADMIN"), getAllAdmins);

/**
 * @swagger
 * /api/super-admin/admins/{id}/reassign:
 *   patch:
 *     summary: Reassign an admin to a different hostel (SUPER_ADMIN only)
 *     tags: [SuperAdmin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hostelId]
 *             properties:
 *               hostelId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin reassigned successfully
 */
router.patch("/admins/:id/reassign", protect, authorize("SUPER_ADMIN"), validate(reassignAdminSchema), reassignAdmin);

/**
 * @swagger
 * /api/super-admin/admins/{id}:
 *   delete:
 *     summary: Remove an admin (demote to USER) (SUPER_ADMIN only)
 *     tags: [SuperAdmin]
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
 *         description: Admin removed successfully
 */
router.delete("/admins/:id", protect, authorize("SUPER_ADMIN"), removeAdmin);

/**
 * @swagger
 * /api/super-admin:
 *   post:
 *     summary: Create a system-wide hostel (SUPER_ADMIN only)
 *     tags: [SuperAdmin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address]
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hostel created successfully
 */
router.post("/", protect, authorize("SUPER_ADMIN"), validate(createHostelSchema), createHostel);

/**
 * @swagger
 * /api/super-admin/assign-admin:
 *   post:
 *     summary: Assign an admin to a specific hostel (SUPER_ADMIN only)
 *     tags: [SuperAdmin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, hostelId]
 *             properties:
 *               userId:
 *                 type: string
 *               hostelId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin assigned successfully
 */
router.post(
  "/assign-admin",
  protect,
  authorize("SUPER_ADMIN"),
  validate(assignAdminSchema),
  assignAdmin
);

export const superAdminRouter = router;