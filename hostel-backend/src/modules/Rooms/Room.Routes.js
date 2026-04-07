import { Router } from "express";

import {
  createRoom,
  getRooms,
  assignBed,
  vacateBed,
} from "./Room.Controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import { validate } from "../../middleware/Validate.Middleware.js";
import { createRoomSchema, assignBedSchema, vacateBedSchema } from "./Room.Schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Room
 *   description: Hostel Room and Bed Management
 */

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create a new room (ADMIN only)
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roomNo, capacity, hostelId]
 *             properties:
 *               roomNo:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               hostelId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Room created successfully
 */
router.post("/", protect, authorize("ADMIN"), validate(createRoomSchema), createRoom);
/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: hostelId
 *         schema:
 *           type: string
 *         description: Filter rooms by hostel ID
 *     responses:
 *       200:
 *         description: List of rooms
 */
router.get("/", protect, getRooms);

/**
 * @swagger
 * /api/rooms/assign-bed:
 *   post:
 *     summary: Assign a bed to a user (ADMIN only)
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, bedId]
 *             properties:
 *               userId:
 *                 type: string
 *               bedId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bed assigned successfully
 */
router.post("/assign-bed", protect, authorize("ADMIN"), validate(assignBedSchema), assignBed);
/**
 * @swagger
 * /api/rooms/vacate-bed:
 *   post:
 *     summary: Vacate a user's bed (ADMIN only)
 *     tags: [Room]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bed vacated successfully
 */
router.post("/vacate-bed", protect, authorize("ADMIN"), validate(vacateBedSchema), vacateBed);
export default router;