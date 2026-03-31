import express from "express";
import {
  razorpayWebhook
} from "./PaymentWebhook.Controller.js";

const router = express.Router();


router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

export default router;