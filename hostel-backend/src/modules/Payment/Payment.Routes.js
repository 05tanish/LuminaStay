import { Router } from "express";
import { protect } from "../../middleware/Authentification.Middleware.js";
import { authorize } from "../../middleware/authorization.Middleware.js";
import {
    razorpayWebhook,
    getUserPayments,
    getAllPayments,
    cashPayment,
    createOrder
} from "../Payment/PaymentWebhook.Controller.js";
const router = Router();
router.post("/create-order", protect, createOrder);
router.post("/webhook", razorpayWebhook);
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
router.post("/cash", protect, authorize("Admin"), cashPayment);

router.get("/my-payments", protect, getUserPayments);

router.get("/all", protect, authorize("Admin"), getAllPayments);


export default router;