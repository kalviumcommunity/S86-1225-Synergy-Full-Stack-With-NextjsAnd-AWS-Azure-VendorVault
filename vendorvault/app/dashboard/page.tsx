export default function Dashboard() {
  return (
    <main className="flex flex-col items-center mt-10">
      <div className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-lg text-gray-600 mb-6">
          👤 Only logged-in users can see this page.
        </p>

        <div className="bg-green-50 border-l-4 border-green-600 p-4">
          <p className="text-green-900">
            ✓ You are authenticated! This is a protected route.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Status</h3>
            <p className="text-sm">Active</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Documents</h3>
            <p className="text-sm">5 files</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Applications</h3>
            <p className="text-sm">2 pending</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Licenses</h3>
            <p className="text-sm">3 active</p>
          </div>
        </div>
      </div>
    </main>
  );
}
