/**
 * Email API Route - Transactional Email Service
 * Sends emails for welcome, password reset, vendor applications, and license approvals
 */

import { NextResponse, NextRequest } from "next/server";
import { sendEmail, EmailPayload } from "@/services/email.service";

import { sanitizeInput } from "@/utils/sanitize";

export async function POST(req: NextRequest) {
  try {
    // Validate request method
    if (req.method !== "POST") {
      return NextResponse.json(
        { success: false, error: "Method not allowed" },
        { status: 405 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate required fields
    // Sanitize all user-provided fields
    const to = sanitizeInput(body.to);
    const subject = sanitizeInput(body.subject);
    const html = sanitizeInput(body.html); // If you want to allow some HTML, adjust allowedTags in sanitize.ts

    if (!to || !subject || !html) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: to, subject, html",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Prepare email payload
    const emailPayload: EmailPayload = {
      to,
      subject,
      html,
      from: sanitizeInput(body.from || process.env.SENDGRID_SENDER || ""),
    };

    // Send email
    const result = await sendEmail(emailPayload);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: result.messageId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Email API Error:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    status: "Email API service is running",
    provider: "SendGrid",
    timestamp: new Date().toISOString(),
  });
}
