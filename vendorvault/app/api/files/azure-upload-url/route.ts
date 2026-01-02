import { NextRequest, NextResponse } from "next/server";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";

/**
 * GET /api/files/azure-upload-url
 * Generate SAS URL for direct Azure Blob Storage upload
 *
 * Query Parameters:
 * - fileName: Name of the file to upload
 * - fileType: MIME type of the file
 * - fileSize: Size of file in bytes (optional)
 * - containerName: Container name (optional, defaults to 'uploads')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");
    const fileType = searchParams.get("fileType");
    const containerName = searchParams.get("containerName") || "uploads";

    // Validate parameters
    if (!fileName || !fileType) {
      return NextResponse.json(
        {
          success: false,
          error: "fileName and fileType are required",
        },
        { status: 400 }
      );
    }

    // Check Azure configuration
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!accountName || (!accountKey && !connectionString)) {
      return NextResponse.json(
        {
          success: false,
          error: "Azure Blob Storage is not configured",
        },
        { status: 503 }
      );
    }

    // Create BlobServiceClient
    const blobServiceClient = connectionString
      ? BlobServiceClient.fromConnectionString(connectionString)
      : new BlobServiceClient(
          `https://${accountName}.blob.core.windows.net`,
          new StorageSharedKeyCredential(accountName, accountKey!)
        );

    // Generate unique blob name
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const sanitizedFilename = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blobName = `${timestamp}_${randomStr}_${sanitizedFilename}`;

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Ensure container exists
    await containerClient.createIfNotExists({
      access: undefined, // 'private' is not valid, use undefined for private container
    });

    // Get blob client
    const blobClient = containerClient.getBlobClient(blobName);

    // Generate SAS token (expires in 60 seconds)
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + 60 * 1000);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("w"), // Write permission only
        startsOn,
        expiresOn,
        contentType: fileType,
      },
      new StorageSharedKeyCredential(accountName!, accountKey!)
    ).toString();

    const uploadUrl = `${blobClient.url}?${sasToken}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      blobName,
      containerName,
      expiresIn: 60,
      message: "Azure SAS URL generated successfully",
    });
  } catch (error) {
    console.error("Error generating Azure SAS URL:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate upload URL",
      },
      { status: 500 }
    );
  }
}
