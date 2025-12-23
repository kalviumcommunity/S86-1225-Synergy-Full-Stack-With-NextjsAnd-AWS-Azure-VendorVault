/**
 * QR Code generation utilities
 */

import QRCode from "qrcode";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "./prisma";

/**
 * Generate QR code for a license and save it to public/qrcodes
 * @param licenseNumber - The license number to encode
 * @returns URL path to the generated QR code
 */
export async function generateQRCode(licenseNumber: string): Promise<string> {
  try {
    // Create QR codes directory if it doesn't exist
    const qrCodesDir = path.join(process.cwd(), "public", "qrcodes");
    await mkdir(qrCodesDir, { recursive: true });

    // Generate unique filename
    const filename = `${licenseNumber}-${Date.now()}.png`;
    const filepath = path.join(qrCodesDir, filename);

    // QR code data includes verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${licenseNumber}`;

    const qrData = JSON.stringify({
      licenseNumber,
      verificationUrl,
      generatedAt: new Date().toISOString(),
    });

    // Generate QR code with high quality settings
    await QRCode.toFile(filepath, qrData, {
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // High error correction
    });

    // Return public URL path
    const publicUrl = `/qrcodes/${filename}`;

    // Update license with QR code URL and data
    await prisma.license.updateMany({
      where: { licenseNumber },
      data: {
        qrCodeUrl: publicUrl,
        qrCodeData: qrData,
      },
    });

    console.log("✅ QR Code generated successfully:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("❌ Error generating QR code:", error);
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
