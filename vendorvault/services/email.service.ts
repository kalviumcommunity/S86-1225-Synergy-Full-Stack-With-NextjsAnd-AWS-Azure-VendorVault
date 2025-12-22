/**
 * Email Service using SendGrid
 * Handles sending transactional emails for VendorVault
 */

import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  console.warn("⚠️ SENDGRID_API_KEY not configured. Email sending disabled.");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

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
}

/**
 * Send email using SendGrid
 * @param payload Email configuration (to, subject, html)
 * @returns Success status with message ID
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResponse> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SendGrid API key not configured");
    }

    const emailData = {
      to: payload.to,
      from:
        payload.from ||
        process.env.SENDGRID_SENDER ||
        "noreply@vendorvault.com",
      subject: payload.subject,
      html: payload.html,
    };

    const response = await sgMail.send(emailData);

    // SendGrid returns an array with response details
    const messageId = response[0].headers["x-message-id"] || "unknown";

    console.log(`✅ Email sent successfully to ${payload.to}`);
    console.log(`📧 Message ID: ${messageId}`);

    return {
      success: true,
      messageId,
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
 * Send vendor application status update
 */
export async function sendVendorApplicationEmail(
  email: string,
  template: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: "Vendor Application Update",
    html: template,
  });
}

/**
 * Send license approval notification
 */
export async function sendLicenseApprovalEmail(
  email: string,
  template: string
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: "Your License Has Been Approved! 🎉",
    html: template,
  });
}
