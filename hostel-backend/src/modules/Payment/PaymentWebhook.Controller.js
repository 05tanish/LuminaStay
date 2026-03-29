import asyncHandler from "../../utils/asyncHandler.js";
import { verifyWebhookService } from "../services/payment.service.js";

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    return res.status(400).json({ message: "Missing signature" });
  }

  try {
    await verifyWebhookService(req.body, signature);

    // ✅ Always return 200 (Razorpay expects this)
    res.status(200).json({ status: "ok" });

  } catch (error) {
    console.error("Webhook error:", error.message);

    // ❗ Still return 200 to avoid repeated retries storm
    res.status(200).json({ status: "error handled" });
  }
});