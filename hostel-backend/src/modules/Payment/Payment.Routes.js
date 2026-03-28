import { Router } from "express";
import { createOrder } from "..Payment/Payment.Controller.js";
import { authenticate } from "../../middlewares/auth.js";

const router = Router();
router.post("/create-order", authenticate, createOrder);
router.post("/webhook", razorpayWebhook);
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
router.post("/cash", authenticate, authorizeAdmin, cashPayment);

router.get("/my-payments", authenticate, getUserPayments);

router.get("/all", authenticate, authorizeAdmin, getAllPayments);


export default router;