import express from "express";
import { createcomplaint, deletecomplaint, getcomplaint, updatecomplaint, updatecomplaintstatus } from "./Complaint.Controller.js";
import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Complaint
 *   description: Student Complaints Management
 */

/**
 * @swagger
 * /api/complaint:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaint]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Complaint created successfully
 */
router.post("/", protect, createcomplaint);
/**
 * @swagger
 * /api/complaint/{complaintID}:
 *   delete:
 *     summary: Delete a complaint
 *     tags: [Complaint]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint deleted
 *       403:
 *         description: Not authorized to delete this complaint
 */
router.delete("/:complaintID", protect, deletecomplaint);
/**
 * @swagger
 * /api/complaint:
 *   get:
 *     summary: Get all complaints (with pagination)
 *     tags: [Complaint]
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
 *         description: List of complaints
 */
router.get("/", protect, getcomplaint);
/**
 * @swagger
 * /api/complaint/{complaintID}:
 *   put:
 *     summary: Update a complaint (owner only)
 *     tags: [Complaint]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintID
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint updated
 */
router.put("/:complaintID", protect, updatecomplaint);
/**
 * @swagger
 * /api/complaint/status:
 *   patch:
 *     summary: Update complaint status (ADMIN only)
 *     tags: [Complaint]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [complaintID, status]
 *             properties:
 *               complaintID:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/status", protect, authorize("ADMIN"), updatecomplaintstatus);

export default router;