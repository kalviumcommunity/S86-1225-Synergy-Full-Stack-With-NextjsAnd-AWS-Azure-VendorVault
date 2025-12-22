/**
 * Email Integration Examples
 * This file demonstrates how to use the email service in your application
 */

import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVendorApplicationEmail,
  sendLicenseApprovalEmail,
} from "@/services/email.service";
import {
  welcomeTemplate,
  passwordResetTemplate,
  vendorApplicationTemplate,
  licenseApprovalTemplate,
} from "@/lib/email-templates";

/**
 * Example 1: Send Welcome Email After User Signup
 * Called in: app/api/auth/signup/route.ts
 */
export async function handleUserSignup(
  email: string,
  firstName: string,
  lastName: string
) {
  const userName = `${firstName} ${lastName}`;
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`;

  const template = welcomeTemplate(userName, loginUrl);

  const result = await sendWelcomeEmail(email, userName, template);

  if (result.success) {
    console.log(
      `Welcome email sent to ${email} (MessageID: ${result.messageId})`
    );
  } else {
    console.error(`Failed to send welcome email: ${result.error}`);
  }

  return result;
}

/**
 * Example 2: Send Password Reset Email
 * Called in: app/api/auth/reset-password/route.ts
 */
export async function handlePasswordResetRequest(
  email: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
  const expiresIn = "24 hours";

  const template = passwordResetTemplate(resetUrl, expiresIn);

  const result = await sendPasswordResetEmail(email, template);

  if (result.success) {
    console.log(
      `Password reset email sent to ${email} (MessageID: ${result.messageId})`
    );
  } else {
    console.error(`Failed to send reset email: ${result.error}`);
  }

  return result;
}

/**
 * Example 3: Send Vendor Application Status Update
 * Called in: app/api/vendor/apply/route.ts or admin approval flow
 */
export async function handleVendorApplicationUpdate(
  email: string,
  vendorName: string,
  applicationStatus: "pending" | "approved" | "rejected",
  dashboardUrl: string = `${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard`
) {
  const template = vendorApplicationTemplate(
    vendorName,
    applicationStatus,
    dashboardUrl
  );

  const result = await sendVendorApplicationEmail(email, template);

  if (result.success) {
    console.log(
      `Vendor application email sent to ${email} (MessageID: ${result.messageId})`
    );
  } else {
    console.error(`Failed to send vendor email: ${result.error}`);
  }

  return result;
}

/**
 * Example 4: Send License Approval Notification
 * Called in: app/api/license/approve/route.ts (admin endpoint)
 */
export async function handleLicenseApproval(
  email: string,
  licenseNumber: string,
  verifyUrl: string = `${process.env.NEXT_PUBLIC_APP_URL}/verify`
) {
  const template = licenseApprovalTemplate(
    licenseNumber,
    `${verifyUrl}/${licenseNumber}`
  );

  const result = await sendLicenseApprovalEmail(email, template);

  if (result.success) {
    console.log(
      `License approval email sent to ${email} (MessageID: ${result.messageId})`
    );
  } else {
    console.error(`Failed to send license email: ${result.error}`);
  }

  return result;
}

/**
 * Usage in API Routes:
 *
 * Example in app/api/auth/signup/route.ts:
 * ```
 * import { handleUserSignup } from "@/lib/email-integration";
 *
 * export async function POST(req: Request) {
 *   const { email, firstName, lastName } = await req.json();
 *   // ... create user in database ...
 *   await handleUserSignup(email, firstName, lastName);
 *   return NextResponse.json({ success: true });
 * }
 * ```
 */
