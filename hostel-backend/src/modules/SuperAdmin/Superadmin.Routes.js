import { Router } from "express";

import {
  createHostel,
  assignAdmin
} from "./Superadmin.Controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import { authorizeHostelRole } from "../../middleware/HostelRole.Middelware.js";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: SuperAdmin
 *   description: Super Administration Endpoints
 */

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
router.post("/", protect, authorize("SUPER_ADMIN"), createHostel);

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
  assignAdmin
);

export default router;