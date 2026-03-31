import { Router } from "express";
import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import {
    createOrder,
    cashPayment,
    getUserPayments,
    getAllPayments,
} from "./Payment.Controller.js";
import { razorpayWebhook } from "./PaymentWebhook.Controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Fee and Payment Management
 */

//  Online payment flow
/**
 * @swagger
 * /api/payment/create-order:
 *   post:
 *     summary: Create a Razorpay order
 *     tags: [Payment]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order created
 */
router.post("/create-order", protect, createOrder);

/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: Razorpay webhook endpoint
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post("/webhook", razorpayWebhook);

/**
 * @swagger
 * /api/payment/cash:
 *   post:
 *     summary: Record a cash payment (ADMIN only)
 *     tags: [Payment]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, amount, remarks]
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cash payment recorded
 */
router.post("/cash", protect, authorize("ADMIN"), cashPayment);

//  User payment history
/**
 * @swagger
 * /api/payment/my-payments:
 *   get:
 *     summary: Get payment history for current user
 *     tags: [Payment]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user payments
 */
router.get("/my-payments", protect, getUserPayments);

/**
 * @swagger
 * /api/payment/all:
 *   get:
 *     summary: Get all payments across the system (ADMIN only)
 *     tags: [Payment]
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
 *         description: Paginated list of all payments
 */
router.get("/all", protect, authorize("ADMIN"), getAllPayments);

export default router;