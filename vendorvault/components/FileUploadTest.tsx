"use client";

import { useState } from "react";

export default function FileUploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [uploadType, setUploadType] = useState<"s3" | "azure">("s3");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setResult("❌ Please select a file first");
      return;
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setResult(`❌ File too large! Max size: ${MAX_SIZE / 1024 / 1024}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setResult(`❌ Invalid file type! Allowed: ${allowedTypes.join(", ")}`);
      return;
    }

    setUploading(true);
    setResult("⏳ Generating upload URL...");

    try {
      // Step 1: Get presigned/SAS URL
      const endpoint =
        uploadType === "s3"
          ? `/api/files/upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&fileSize=${file.size}`
          : `/api/files/azure-upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`;

      const urlResponse = await fetch(endpoint);
      const urlData = await urlResponse.json();

      if (!urlData.success && !urlData.uploadUrl) {
        setResult(
          `❌ Failed to get upload URL: ${urlData.error || "Unknown error"}`
        );
        setUploading(false);
        return;
      }

      setResult("⏳ Uploading file...");

      // Step 2: Upload file directly to S3/Azure
      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
          ...(uploadType === "azure" ? { "x-ms-blob-type": "BlockBlob" } : {}),
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      setResult(
        `✅ Upload successful!\n\nFile Key: ${urlData.fileKey || urlData.blobName}\nStorage: ${uploadType.toUpperCase()}\nSize: ${(file.size / 1024).toFixed(2)} KB`
      );
    } catch (error) {
      setResult(
        `❌ Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          🗂️ Object Storage Test
        </h2>

        <div className="space-y-4">
          {/* Storage Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Storage Provider
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="s3"
                  checked={uploadType === "s3"}
                  onChange={(e) => setUploadType(e.target.value as "s3")}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">AWS S3</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="azure"
                  checked={uploadType === "azure"}
                  onChange={(e) => setUploadType(e.target.value as "azure")}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Azure Blob
                </span>
              </label>
            </div>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Select File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={uploading}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Allowed: JPEG, PNG, WebP, PDF (Max 5MB)
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              !file || uploading
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {uploading ? "⏳ Uploading..." : "📤 Upload File"}
          </button>

          {/* Result Display */}
          {result && (
            <div
              className={`p-4 rounded-lg whitespace-pre-wrap ${
                result.startsWith("✅")
                  ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                  : result.startsWith("❌")
                    ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
              }`}
            >
              {result}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          ℹ️ How it works:
        </h3>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Browser requests a presigned/SAS URL from the API</li>
          <li>API generates a temporary upload URL (60s expiry)</li>
          <li>
            Browser uploads directly to{" "}
            {uploadType === "s3" ? "S3" : "Azure Blob"} (no server)
          </li>
          <li>File is stored securely in the cloud</li>
        </ol>
      </div>
    </div>
  );
}
