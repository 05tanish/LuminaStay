import AppError from "./AppError.js";
import { logger } from "../utils/logger.js";
import { Resend } from "resend";

// Singleton Resend client
let _resendClient = null;

const getResendClient = () => {
  if (!_resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new AppError("Resend API key not configured", 500);
    }
    _resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return _resendClient;
};

// Blocked disposable email domains
const BLOCKED_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'throwaway.email', 'maildrop.cc', 'getnada.com',
  'trashmail.com', 'yopmail.com', 'fakeinbox.com', 'sharklasers.com',
  'guerrillamail.info', 'grr.la', 'spam4.me', 'mailnesia.com',
  'emailondeck.com', 'mintemail.com', 'mytemp.email', 'temp-mail.io',
  'mohmal.com', 'dispostable.com', 'mailcatch.com', 'mailsac.com',
  'tempinbox.com', 'throwawaymail.com', 'getairmail.com', 'anonbox.net',
  'deadaddress.com', 'filzmail.com', 'jetable.org', 'mailexpire.com',
  'meltmail.com', 'mytrashmail.com', 'nowmymail.com', 'pookmail.com',
  'spamex.com', 'spamgourmet.com', 'spaml.com', 'tempalias.com',
  'tempe-mail.com', 'tempemail.com', 'tempmailer.com', 'tempmail.eu',
  'yopmail.fr', 'yopmail.net', 'trashymail.com', 'wegwerfmail.de',
  'spambox.us', 'nospam.ze.tc', 'zoemail.org',
]);

// Validate email and check for disposable domains
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw new AppError("Invalid email address", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (BLOCKED_DOMAINS.has(domain)) {
    throw new AppError("Disposable email addresses are not allowed", 400);
  }

  return true;
};

// Send OTP email
export const sendOtpEmail = async ({ email, otp, name = "User" }) => {
  validateEmail(email);

  const resend = getResendClient();

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Hostel System <onboarding@resend.dev>',
      to: [email],
      subject: 'Your OTP Code - Hostel Management System',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>hostelflow</h1>
              </div>
              <div class="content">
                <h2>Hello ${name}!</h2>
                <p>You requested an OTP to verify your email address. Use the code below to complete your verification:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 10px 0 0 0; color: #666;">This code expires in 5 minutes</p>
                </div>

                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our team will never ask for your OTP.
                </div>

                <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      logger.error("OTP email send failed", { email, error });
      throw new AppError("Failed to send OTP email", 500);
    }

    logger.info("OTP email sent successfully", { email, messageId: data?.id });
    return data;
  } catch (error) {
    logger.error("OTP email error", { email, error: error.message });
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async ({ email, name, role }) => {
  validateEmail(email);

  const resend = getResendClient();

  const roleMessages = {
    SUPER_ADMIN: "You have full platform access to manage all hostels.",
    ADMIN: "You can now manage your hostel, residents, and operations.",
    USER: "You can now access your dashboard, pay fees, and raise complaints.",
  };

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Hostel System <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to Hostel Management System! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .feature-item { padding: 10px 0; border-bottom: 1px solid #eee; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome Aboard!</h1>
              </div>
              <div class="content">
                <h2>Hello ${name}!</h2>
                <p>Your account has been successfully created. ${roleMessages[role] || "You're all set to get started!"}</p>
                
                <div class="features">
                  <h3>What you can do:</h3>
                  ${role === 'SUPER_ADMIN' ? `
                    <div class="feature-item">✅ Create and manage multiple hostels</div>
                    <div class="feature-item">✅ Assign admins to hostels</div>
                    <div class="feature-item">✅ View platform-wide analytics</div>
                    <div class="feature-item">✅ Generate invite codes</div>
                  ` : role === 'ADMIN' ? `
                    <div class="feature-item">✅ Manage residents and rooms</div>
                    <div class="feature-item">✅ Create and track monthly fees</div>
                    <div class="feature-item">✅ Handle complaints and requests</div>
                    <div class="feature-item">✅ Update daily food menus</div>
                    <div class="feature-item">✅ Send notifications to residents</div>
                  ` : `
                    <div class="feature-item">✅ View and pay monthly fees online</div>
                    <div class="feature-item">✅ Raise and track complaints</div>
                    <div class="feature-item">✅ Check daily food menu</div>
                    <div class="feature-item">✅ Receive important notifications</div>
                  `}
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
                </div>

                <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      logger.error("Welcome email send failed", { email, error });
      throw new AppError("Failed to send welcome email", 500);
    }

    logger.info("Welcome email sent successfully", { email, messageId: data?.id });
    return data;
  } catch (error) {
    logger.error("Welcome email error", { email, error: error.message });
    throw error;
  }
};

// Send invite email
export const sendInviteEmail = async ({ email, inviteCode, role, hostelName, expiresAt, inviteLink }) => {
  validateEmail(email);

  const resend = getResendClient();

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Hostel System <onboarding@resend.dev>',
      to: [email],
      subject: `You're invited to join ${hostelName}! 🏠`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .invite-box { background: white; border: 2px solid #667eea; padding: 25px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .invite-code { font-size: 28px; font-weight: bold; color: #667eea; letter-spacing: 4px; background: #f0f4ff; padding: 15px; border-radius: 5px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏠 You've Been Invited!</h1>
              </div>
              <div class="content">
                <h2>Welcome to ${hostelName}</h2>
                <p>You have been invited to join as a <strong>${role === 'ADMIN' ? 'Hostel Admin' : 'Resident'}</strong>.</p>
                
                <div class="invite-box">
                  <p style="margin: 0 0 10px 0; color: #666;">Your Invite Code:</p>
                  <div class="invite-code">${inviteCode}</div>
                </div>

                <div style="text-align: center;">
                  <a href="${inviteLink}" class="button">Accept Invitation</a>
                </div>

                <div class="info-box">
                  <strong>📋 Next Steps:</strong>
                  <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Click the button above or use the invite code during registration</li>
                    <li>Complete your profile information</li>
                    <li>Start using the hostel management system</li>
                  </ol>
                </div>

                <p style="margin-top: 20px;"><strong>⏰ Expires:</strong> ${new Date(expiresAt).toLocaleString()}</p>
                <p style="color: #666; font-size: 14px;">This invitation is valid for 24 hours. If you didn't expect this invitation, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      logger.error("Invite email send failed", { email, error });
      throw new AppError("Failed to send invite email", 500);
    }

    logger.info("Invite email sent successfully", { email, messageId: data?.id });
    return data;
  } catch (error) {
    logger.error("Invite email error", { email, error: error.message });
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async ({ email, resetToken, name = "User" }) => {
  validateEmail(email);

  const resend = getResendClient();
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Hostel System <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset Your Password - Hostel Management System',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Hello ${name}!</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetLink}" class="button">Reset Password</a>
                </div>

                <p style="margin-top: 20px;">This link will expire in 1 hour for security reasons.</p>

                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a></p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      logger.error("Password reset email send failed", { email, error });
      throw new AppError("Failed to send password reset email", 500);
    }

    logger.info("Password reset email sent successfully", { email, messageId: data?.id });
    return data;
  } catch (error) {
    logger.error("Password reset email error", { email, error: error.message });
    throw error;
  }
};

// Send payment confirmation email
export const sendPaymentConfirmationEmail = async ({ email, name, amount, month, paymentId, paymentMode }) => {
  validateEmail(email);

  const resend = getResendClient();

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Hostel System <onboarding@resend.dev>',
      to: [email],
      subject: `Payment Confirmation - ${month}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-icon { font-size: 60px; margin-bottom: 10px; }
              .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-label { color: #666; }
              .detail-value { font-weight: bold; }
              .amount { font-size: 32px; color: #10b981; font-weight: bold; text-align: center; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="success-icon">✅</div>
                <h1>Payment Successful!</h1>
              </div>
              <div class="content">
                <h2>Hello ${name}!</h2>
                <p>Your payment has been successfully processed. Here are the details:</p>
                
                <div class="amount">₹${amount}</div>

                <div class="payment-details">
                  <div class="detail-row">
                    <span class="detail-label">Payment For:</span>
                    <span class="detail-value">${month}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value">${paymentId}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Payment Mode:</span>
                    <span class="detail-value">${paymentMode}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date().toLocaleString()}</span>
                  </div>
                </div>

                <p>Thank you for your payment! You can view your payment history anytime from your dashboard.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
                <p>Keep this email for your records.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      logger.error("Payment confirmation email send failed", { email, error });
      throw new AppError("Failed to send payment confirmation email", 500);
    }

    logger.info("Payment confirmation email sent successfully", { email, messageId: data?.id });
    return data;
  } catch (error) {
    logger.error("Payment confirmation email error", { email, error: error.message });
    throw error;
  }
};

// Send notification email
export const sendNotificationEmail = async ({ email, name, title, message }) => {
  validateEmail(email);

  const resend = getResendClient();

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Hostel System <onboarding@resend.dev>',
      to: [email],
      subject: `Notification: ${title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📢 New Notification</h1>
              </div>
              <div class="content">
                <h2>Hello ${name}!</h2>
                <p>You have a new notification from your hostel:</p>
                
                <div class="message-box">
                  <h3 style="margin-top: 0; color: #667eea;">${title}</h3>
                  <p style="margin-bottom: 0;">${message}</p>
                </div>

                <p>Log in to your dashboard to view more details and stay updated.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      logger.error("Notification email send failed", { email, error });
      // Don't throw error for notification emails - they're not critical
      return null;
    }

    logger.info("Notification email sent successfully", { email, messageId: data?.id });
    return data;
  } catch (error) {
    logger.error("Notification email error", { email, error: error.message });
    return null;
  }
};