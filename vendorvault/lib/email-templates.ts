/**
 * Email Templates for VendorVault
 * Reusable HTML email templates with personalization
 */

export const welcomeTemplate = (userName: string, loginUrl: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .button { display: inline-block; margin: 20px 0; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to VendorVault! 🎉</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>We're thrilled to have you join VendorVault! Your account is now active and ready to use.</p>
          <p>Get started by logging in to your dashboard:</p>
          <a href="${loginUrl}" class="button">Access Your Dashboard</a>
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Complete your vendor profile</li>
            <li>Upload required documents</li>
            <li>Apply for vendor status</li>
            <li>Start receiving license approvals</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>© 2025 VendorVault. This is an automated email. Please do not reply.</p>
          <p><small>If you didn't create this account, please ignore this email.</small></p>
        </div>
      </div>
    </body>
  </html>
`;

export const passwordResetTemplate = (resetUrl: string, expiresIn: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .alert { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .button { display: inline-block; margin: 20px 0; padding: 12px 30px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 4px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>We received a request to reset your VendorVault password.</p>
          <div class="alert">
            <strong>⚠️ Security Notice:</strong> This link expires in <strong>${expiresIn}</strong>. If you didn't request this, you can safely ignore this email.
          </div>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p><strong>Or copy this link:</strong></p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${resetUrl}
          </p>
          <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© 2025 VendorVault. This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
  </html>
`;

export const vendorApplicationTemplate = (
  vendorName: string,
  applicationStatus: string,
  dashboardUrl: string
) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .status-pending { background-color: #fff3cd; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; }
        .status-approved { background-color: #d4edda; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; margin: 20px 0; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Vendor Application Update</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${vendorName}</strong>,</p>
          ${
            applicationStatus === "approved"
              ? `<div class="status-approved">
                  <h3>✅ Your Vendor Application Has Been Approved!</h3>
                  <p>Congratulations! Your vendor application has been reviewed and approved. You can now access all vendor features.</p>
                </div>`
              : `<div class="status-pending">
                  <h3>⏳ Your Vendor Application is Under Review</h3>
                  <p>Thank you for submitting your vendor application. Our team is currently reviewing your documents.</p>
                </div>`
          }
          <p>Check your application status and next steps in your dashboard:</p>
          <a href="${dashboardUrl}" class="button">View Dashboard</a>
          <p>If you have any questions about your application, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>© 2025 VendorVault. This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
  </html>
`;

export const licenseApprovalTemplate = (
  licenseNumber: string,
  approvalUrl: string
) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .license-box { background-color: #f0f8ff; border: 2px solid #4CAF50; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; margin: 20px 0; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 License Approved!</h1>
        </div>
        <div class="content">
          <p>Congratulations! Your license has been approved by the administrator.</p>
          <div class="license-box">
            <h2>License Number:</h2>
            <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">${licenseNumber}</p>
          </div>
          <p>Your license is now active. You can view more details and download your license certificate:</p>
          <a href="${approvalUrl}" class="button">View License Details</a>
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Download your license certificate</li>
            <li>Share your QR code with clients</li>
            <li>Start your vendor operations</li>
          </ul>
          <p>If you have any questions, reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>© 2025 VendorVault. This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
  </html>
`;
