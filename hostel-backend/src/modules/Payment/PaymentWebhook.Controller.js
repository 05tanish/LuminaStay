import { asyncHandler } from "../../utils/AsyncHandler.js";
import { verifyWebhookService } from "./PaymentWebhook.Service.js";

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    return res.status(400).json({ message: "Missing signature" });
  }

  try {
    await verifyWebhookService(req.body, signature);

    //  Always return 200 — Razorpay expects this to avoid retries
    res.status(200).json({ status: "ok" });

  } catch (error) {
    console.error("Webhook error:", error.message);

    //   Still return 200 to avoid repeated retry storms from Razorpay
    res.status(200).json({ status: "error handled" });
  }
});