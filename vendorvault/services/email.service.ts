/**
 * Email Service using NodeMailer (Production-ready with multiple providers)
 * Handles sending transactional emails for VendorVault
 */

import nodemailer from "nodemailer";

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
};

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.warn(
        "⚠️ SMTP credentials not configured. Email sending will be simulated."
      );
      // Create a test account for development
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "test@ethereal.email",
          pass: "test123",
        },
      });
    }

    transporter = nodemailer.createTransport(EMAIL_CONFIG);
    console.log("✅ Email transporter initialized");
  }
  return transporter;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  previewUrl?: string; // For development testing
}

/**
 * Send email using NodeMailer
 * @param payload Email configuration (to, subject, html)
 * @returns Success status with message ID
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResponse> {
  try {
    const transport = getTransporter();

    const emailData = {
      to: payload.to,
      from:
        payload.from ||
        process.env.EMAIL_FROM ||
        "VendorVault <noreply@vendorvault.com>",
      subject: payload.subject,
      html: payload.html,
    };

    const info = await transport.sendMail(emailData);

    console.log("✅ Email sent successfully to", payload.to);
    console.log("📧 Message ID:", info.messageId);

    // Get preview URL for development (Ethereal email)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("📧 Preview URL:", previewUrl);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Email send failed:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  template: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: "Welcome to VendorVault 🎉",
    html: template,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  template: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: "Reset Your VendorVault Password",
    html: template,
  });
}

/**
 * Send vendor application status email
 */
export async function sendVendorApplicationEmail(
  email: string,
  template: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: "Vendor Application Status - VendorVault",
    html: template,
  });
}

/**
 * Send license approval email
 */
export async function sendLicenseApprovalEmail(
  email: string,
  template: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: "🎉 License Approved - VendorVault",
    html: template,
  });
}

/**
 * Send license rejection email
 */
export async function sendLicenseRejectionEmail(
  email: string,
  template: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: "License Application Update - VendorVault",
    html: template,
  });
}
