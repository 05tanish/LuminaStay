import crypto from "crypto";
import { prisma } from "../../config/db.js";
import { logger } from "../../utils/logger.js";

export const verifyWebhookService = async (rawBody, signature) => {
  // 🔐 Step 1: Generate signature from RAW body
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody) // ⚠️ RAW buffer, NOT JSON.stringify
    .digest("hex");

  // 🔐 Step 2: Compare signatures securely
  if (!crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  )) {
    throw new Error("Invalid webhook signature");
  }

  // 📦 Step 3: Parse body AFTER verification
  const body = JSON.parse(rawBody.toString());

  // ✅ Step 4: Validate event type
  if (body.event !== "payment.captured") {
    return; // ignore other events
  }

  const paymentData = body.payload.payment.entity;
  const orderId = paymentData.order_id;

  // 🔎 Step 5: Fetch payment
  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId: orderId }
  });

  if (!payment) {
    logger.warn("Webhook received for unknown order", { orderId });
    return;
  }

  // 🔁 Step 6: Idempotency check
  if (payment.status === "PAID") {
    logger.debug("Webhook duplicate — payment already processed", { orderId });
    return;
  }

  // 💾 Step 7: Transaction (atomic update)
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        razorpayPaymentId: paymentData.id
      }
    }),

    prisma.monthlyFee.update({
      where: { id: payment.monthlyFeeId },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    })
  ]);
};