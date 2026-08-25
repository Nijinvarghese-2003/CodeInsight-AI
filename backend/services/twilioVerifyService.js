import twilio from "twilio";
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 1. Twilio Verify Service Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// 2. Twilio SendGrid Credentials
const sendgridApiKey = process.env.SENDGRID_API_KEY || process.env.TWILIO_SENDGRID_API_KEY;
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || "no-reply@campus.edu";

if (sendgridApiKey && sendgridApiKey.startsWith("SG.")) {
  sgMail.setApiKey(sendgridApiKey);
}

// 3. SMTP / Gmail / Nodemailer Credentials
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

let smtpTransporter = null;
if (smtpUser && smtpPass) {
  smtpTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

// Twilio Client
let twilioClient = null;
if (accountSid && authToken && accountSid.startsWith("AC")) {
  try {
    twilioClient = twilio(accountSid, authToken);
  } catch (err) {
    console.warn("Twilio client initialization warning:", err.message);
  }
}

// In-memory OTP storage for direct email sending and dev fallback
// Stores: normalizedEmail -> { code, expiresAt }
const otpStore = new Map();

/**
 * Generate standard HTML email template for the OTP
 */
const getOtpEmailHtml = (otpCode, targetEmail) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Registration Verification Code</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 30px; color: #e2e8f0;">
    <div style="max-width: 520px; margin: 0 auto; background-color: #111827; border: 1px solid #1e293b; border-radius: 16px; padding: 36px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      <div style="display: inline-block; padding: 10px 18px; border-radius: 12px; background-color: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); margin-bottom: 20px;">
        <span style="color: #06b6d4; font-weight: 800; font-size: 16px; letter-spacing: 1px;">CODEINSIGHT-AI</span>
      </div>
      <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 12px 0;">Verify Your Campus Registration</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        You are registering an account for <strong style="color: #06b6d4;">${targetEmail}</strong>. Please use the following 6-digit verification code to complete your registration.
      </p>
      
      <div style="background: linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15)); border: 1px solid rgba(6,182,212,0.4); border-radius: 12px; padding: 18px; margin: 24px 0; letter-spacing: 8px; font-size: 32px; font-weight: 800; font-family: monospace; color: #22d3ee;">
        ${otpCode}
      </div>

      <p style="color: #64748b; font-size: 12px; margin: 16px 0 0 0;">
        ⏱️ This verification code is valid for <strong>10 minutes</strong>. If you did not request this registration, please ignore this email.
      </p>
    </div>
  </body>
  </html>
  `;
};

/**
 * Send an email verification OTP code to the specified email address
 * Supports:
 * 1. Twilio Verify V2 (Email Channel)
 * 2. Twilio SendGrid (@sendgrid/mail)
 * 3. SMTP (Nodemailer / Gmail)
 * 4. Dev mode fallback (Console log)
 *
 * @param {string} email - Destination email address
 * @returns {Promise<{ success: boolean, message: string, isDevMode?: boolean, devCode?: string }>}
 */
export const sendEmailVerificationOtp = async (email) => {
  const normalizedEmail = (email || "").toLowerCase().trim();
  if (!normalizedEmail) {
    throw new Error("Valid email address is required");
  }

  // 1. Check if Twilio Verify V2 Service is configured
  if (
    twilioClient &&
    verifyServiceSid &&
    verifyServiceSid.startsWith("VA") &&
    !verifyServiceSid.includes("your_")
  ) {
    try {
      console.log(`[Twilio Verify] Sending verification email to ${normalizedEmail}...`);
      const verification = await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verifications.create({
          to: normalizedEmail,
          channel: "email",
        });

      return {
        success: true,
        status: verification.status,
        message: `Verification code sent directly to ${normalizedEmail}`,
      };
    } catch (error) {
      console.error("Twilio Verify Service error, trying fallback mailer:", error.message);
      // Fall through to SendGrid/SMTP if Verify service fails
    }
  }

  // Generate 6-digit OTP code for Direct Email / SendGrid / SMTP / Dev
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(normalizedEmail, {
    code: otpCode,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // 2. Check if Twilio SendGrid is configured
  if (sendgridApiKey && sendgridApiKey.startsWith("SG.")) {
    try {
      console.log(`[Twilio SendGrid] Dispatching OTP email to ${normalizedEmail}...`);
      await sgMail.send({
        to: normalizedEmail,
        from: sendgridFromEmail,
        subject: `Your Verification Code: ${otpCode} - CodeInsight-AI`,
        text: `Your CodeInsight-AI verification code is: ${otpCode}. It expires in 10 minutes.`,
        html: getOtpEmailHtml(otpCode, normalizedEmail),
      });

      console.log(`[Twilio SendGrid] Successfully delivered email to ${normalizedEmail}`);
      return {
        success: true,
        message: `Verification code sent directly to ${normalizedEmail}`,
      };
    } catch (error) {
      console.error("Twilio SendGrid delivery error:", error.response?.body || error.message);
    }
  }

  // 3. Check if SMTP / Gmail (Nodemailer) is configured
  if (smtpTransporter) {
    try {
      console.log(`[SMTP Mailer] Dispatching OTP email to ${normalizedEmail}...`);
      await smtpTransporter.sendMail({
        from: `"CodeInsight-AI" <${smtpUser}>`,
        to: normalizedEmail,
        subject: `Your Verification Code: ${otpCode} - CodeInsight-AI`,
        text: `Your CodeInsight-AI verification code is: ${otpCode}. It expires in 10 minutes.`,
        html: getOtpEmailHtml(otpCode, normalizedEmail),
      });

      console.log(`[SMTP Mailer] Successfully delivered email to ${normalizedEmail}`);
      return {
        success: true,
        message: `Verification code sent directly to ${normalizedEmail}`,
      };
    } catch (error) {
      console.error("SMTP delivery error:", error.message);
    }
  }

  // 4. Safe development fallback when no live mail provider is configured in .env
  console.log(`\n======================================================`);
  console.log(`[Twilio / Email Dev Mode] OTP sent to: ${normalizedEmail}`);
  console.log(`[Twilio / Email Dev Mode] 6-digit Code: ${otpCode}`);
  console.log(`[Twilio / Email Dev Mode] Tip: To deliver to real inbox, add Twilio Verify / SendGrid / SMTP credentials in backend/.env`);
  console.log(`======================================================\n`);

  return {
    success: true,
    isDevMode: true,
    message: `Verification code sent for ${normalizedEmail} (Dev code logged to server console)`,
    devCode: otpCode,
  };
};

/**
 * Verify the OTP code sent to the email
 * @param {string} email - Destination email address
 * @param {string} code - 6-digit verification code
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const verifyEmailOtp = async (email, code) => {
  const normalizedEmail = (email || "").toLowerCase().trim();
  const trimmedCode = (code || "").toString().trim();

  if (!trimmedCode) {
    return {
      success: false,
      message: "Please provide the 6-digit verification code",
    };
  }

  // 1. If Twilio Verify service is active
  if (
    twilioClient &&
    verifyServiceSid &&
    verifyServiceSid.startsWith("VA") &&
    !verifyServiceSid.includes("your_")
  ) {
    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({
          to: normalizedEmail,
          code: trimmedCode,
        });

      if (verificationCheck.status === "approved") {
        return {
          success: true,
          message: "Email verified successfully",
        };
      }
    } catch (error) {
      console.warn("Twilio Verify Check check fallback:", error.message);
    }
  }

  // 2. Check local OTP store (SendGrid / SMTP / Dev mode)
  const entry = otpStore.get(normalizedEmail);
  if (!entry) {
    return {
      success: false,
      message: "No verification code requested for this email or code has expired",
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      message: "Verification code has expired. Please request a new code",
    };
  }

  if (entry.code !== trimmedCode) {
    return {
      success: false,
      message: "Invalid verification code. Please check the code and try again",
    };
  }

  // Verification succeeded - clear OTP from store
  otpStore.delete(normalizedEmail);
  return {
    success: true,
    message: "Email verified successfully",
  };
};
