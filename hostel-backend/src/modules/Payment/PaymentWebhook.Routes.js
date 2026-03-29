import express from "express";
import {
  razorpayWebhook
} from "./PaymentWebhook.Controller";

const router = express.Router();

// ❗ ONLY for webhook route
router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// Normal routes
router.use(express.json());