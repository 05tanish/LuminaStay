import axios from "axios";
import { prisma } from "../../config/db.js";

export const sendOtpService = async (phone) => {

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);

  // Save OTP in DB
  await prisma.otp.create({
    data: {
      phone,
      code: otp,
      expiresAt
    }
  });

  // Send via MSG91
  await axios.post("https://control.msg91.com/api/v5/flow/", {
    template_id: process.env.MSG91_TEMPLATE_ID,
    short_url: "0",
    recipients: [
      {
        mobiles: `91${phone}`,
        OTP: otp
      }
    ]
  }, {
    headers: {
      authkey: process.env.MSG91_API_KEY,
      "Content-Type": "application/json"
    }
  });

  return true;
};