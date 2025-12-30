import FileUploadTest from "@/components/FileUploadTest";

export default function StorageTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Object Storage Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test AWS S3 and Azure Blob Storage presigned URL uploads
          </p>
        </div>

        <FileUploadTest />

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📖 What This Tests
          </h2>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p>
              ✅ <strong>Presigned URL Generation</strong>: API creates
              time-limited upload URLs
            </p>
            <p>
              ✅ <strong>Direct Client Upload</strong>: Browser uploads directly
              to S3/Azure (no server)
            </p>
            <p>
              ✅ <strong>File Validation</strong>: Type and size checks before
              upload
            </p>
            <p>
              ✅ <strong>Multi-Provider</strong>: Works with both AWS S3 and
              Azure Blob Storage
            </p>
            <p>
              ✅ <strong>Security</strong>: Private buckets with 60-second
              expiry URLs
            </p>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
            ⚙️ Setup Required
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Make sure you have configured cloud storage credentials in your{" "}
            <code>.env</code> file:
          </p>
          <div className="mt-3 bg-yellow-100 dark:bg-yellow-900/40 rounded p-3 font-mono text-xs text-yellow-900 dark:text-yellow-200">
            <div># For AWS S3:</div>
            <div>AWS_REGION=&quot;us-east-1&quot;</div>
            <div>AWS_ACCESS_KEY_ID=&quot;your-key&quot;</div>
            <div>AWS_SECRET_ACCESS_KEY=&quot;your-secret&quot;</div>
            <div>AWS_BUCKET_NAME=&quot;vendorvault-uploads&quot;</div>
            <div className="mt-2"># For Azure Blob:</div>
            <div>AZURE_STORAGE_CONNECTION_STRING=&quot;...&quot;</div>
            <div>AZURE_STORAGE_CONTAINER_NAME=&quot;uploads&quot;</div>
          </div>
        </div>
      </div>
    </div>
  );
}
