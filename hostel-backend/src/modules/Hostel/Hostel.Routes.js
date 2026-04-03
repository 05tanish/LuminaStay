import { Router } from "express";

import {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  deleteHostel
} from "../Hostel/Hostel.Controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Hostel
 *   description: Hostel Property Management
 */

/**
 * @swagger
 * /api/hostel:
 *   post:
 *     summary: Create a new hostel (ADMIN only)
 *     tags: [Hostel]
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
router.post("/", protect, authorize("SUPERADMIN"), createHostel);
/**
 * @swagger
 * /api/hostel:
 *   get:
 *     summary: Get all hostels (with pagination)
 *     tags: [Hostel]
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
 *         description: List of hostels
 */
router.get("/", protect, getHostels);
/**
 * @swagger
 * /api/hostel/{id}:
 *   get:
 *     summary: Get a specific hostel by ID
 *     tags: [Hostel]
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
 *         description: Hostel details
 *       404:
 *         description: Hostel not found
 */
router.get("/:id", protect, getHostelById);
/**
 * @swagger
 * /api/hostel/{id}:
 *   put:
 *     summary: Update a hostel (ADMIN only)
 *     tags: [Hostel]
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
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hostel updated
 */
router.put("/:id", protect, authorize("ADMIN"), updateHostel);
/**
 * @swagger
 * /api/hostel/{id}:
 *   delete:
 *     summary: Delete a hostel (ADMIN only)
 *     tags: [Hostel]
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
 *         description: Hostel deleted
 */
router.delete("/:id", protect, authorize("ADMIN"), deleteHostel);

export default router;