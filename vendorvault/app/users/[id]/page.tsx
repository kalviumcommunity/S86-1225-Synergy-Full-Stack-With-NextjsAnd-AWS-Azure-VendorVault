import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const { id } = params;

  // Mock user data
  const users: Record<
    string,
    { id: string; name: string; email: string; role: string; joinDate: string }
  > = {
    "1": {
      id: "1",
      name: "Alex Johnson",
      email: "alex@vendorvault.com",
      role: "Vendor Manager",
      joinDate: "2024-01-15",
    },
    "2": {
      id: "2",
      name: "Sam Williams",
      email: "sam@vendorvault.com",
      role: "Document Reviewer",
      joinDate: "2024-02-20",
    },
  };

  const user = users[id];

  return (
    <main className="flex flex-col items-center mt-10">
      <div className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/users/1" className="hover:text-blue-600">
              Users
            </Link>{" "}
            / {id}
          </h2>
        </div>

        {user ? (
          <>
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-gray-600 mb-6">User ID: {user.id}</p>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-semibold">{user.role}</p>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-semibold">{user.joinDate}</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded">
              <p className="text-sm text-blue-900">
                💡 <strong>Dynamic Route Example:</strong> This page uses the
                [id] parameter. Try /users/1 or /users/2
              </p>
            </div>
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 p-6 rounded text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">
              User Not Found
            </h2>
            <p className="text-red-900">No user with ID: {id}</p>
            <p className="text-sm text-red-700 mt-4">Available users: 1, 2</p>
          </div>
        )}
      </div>
    </main>
  );
}
