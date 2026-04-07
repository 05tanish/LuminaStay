import { Router } from "express";
import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import { validate } from "../../middleware/Validate.Middleware.js";
import { createOrderSchema, cashPaymentSchema } from "./Payment.Schema.js";
import {
    createOrder,
    cashPayment,
    getUserPayments,
    getAllPayments,
    getRevenue,
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
router.post("/create-order", protect, validate(createOrderSchema), createOrder);

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
  // Cash payment — route was /payment/cash but frontend called /payment/cash
  // Fix: add both /cash and /admin/cash so both work
  router.post(
    "/cash",
    protect,
    authorize("ADMIN", "SUPER_ADMIN"),
    validate(cashPaymentSchema),
    cashPayment
  );

router.post(
  "/admin/cash",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(cashPaymentSchema),
  cashPayment
);

// Get Revenue
router.get(
  "/revenue",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  getRevenue
);

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