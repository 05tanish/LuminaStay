import AppError from "../../utils/AppError.js";

export const verifyOtpService = async (phone, code) => {

  const otpRecord = await prisma.otp.findFirst({
    where: {
      phone,
      code,
      verified: false
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!otpRecord) {
    throw new AppError("Invalid OTP", 400);
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new AppError("OTP expired", 400);
  }

  // mark OTP used
  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { verified: true }
  });

  // mark user verified
  await prisma.user.update({
    where: { phone },
    data: { phoneVerified: true }
  });

  return true;
};