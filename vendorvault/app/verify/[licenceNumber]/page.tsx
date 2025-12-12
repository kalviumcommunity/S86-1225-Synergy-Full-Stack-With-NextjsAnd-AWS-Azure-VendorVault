"use client";

import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const licenceNumber = params?.licenceNumber ?? "unknown";

  return (
    <div>
      <h1>Verify Licence</h1>
      <p>Licence number: {licenceNumber}</p>
    </div>
  );
}
