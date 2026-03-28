import crypto from "crypto";

export const verifyWebhookService = async (body, signature) => {

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new Error("Invalid signature");
  }

  const paymentData = body.payload.payment.entity;

  const orderId = paymentData.order_id;

  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId: orderId }
  });

  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      razorpayPaymentId: paymentData.id
    }
  });

  await prisma.monthlyFee.update({
    where: { id: payment.monthlyFeeId },
    data: {
      status: "PAID",
      paidAt: new Date()
    }
  });
};

export const razorpayWebhook = asyncHandler(async (req, res) => {

  const signature = req.headers["x-razorpay-signature"];

  await verifyWebhookService(req.body, signature);

  res.status(200).json({ status: "ok" });
});