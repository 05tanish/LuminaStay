import { Router } from "express";

import {
  upsertMenu,
  getMenu,
  createWeeklyMenu,
  getWeeklyMenu
} from "../Food/Food.Controller.js";

import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Food
 *   description: Hostel Mess Menu Management
 */

// DAILY
/**
 * @swagger
 * /api/food/menu:
 *   post:
 *     summary: Upsert daily menu (ADMIN only)
 *     tags: [Food]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, meals]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               meals:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [BREAKFAST, LUNCH, DINNER]
 *                     items:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: Menu updated
 */
router.post("/menu", protect, authorize("ADMIN"), upsertMenu);
/**
 * @swagger
 * /api/food/menu:
 *   get:
 *     summary: Get menu for a specific date
 *     tags: [Food]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to fetch menu for (defaults to today)
 *     responses:
 *       200:
 *         description: Daily menu
 */
router.get("/menu", protect, getMenu);

// WEEKLY
/**
 * @swagger
 * /api/food/menu/weekly:
 *   post:
 *     summary: Create a weekly menu (ADMIN only)
 *     tags: [Food]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startDate, days]
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               days:
 *                 type: array
 *                 description: Array of 7 daily menus
 *     responses:
 *       201:
 *         description: Weekly menu created
 */
router.post("/menu/weekly", protect, authorize("ADMIN"), createWeeklyMenu);
/**
 * @swagger
 * /api/food/menu/weekly:
 *   get:
 *     summary: Get the current week's menu
 *     tags: [Food]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the week (defaults to current week)
 *     responses:
 *       200:
 *         description: Weekly menu
 */
router.get("/menu/weekly", protect, getWeeklyMenu);

export default router;