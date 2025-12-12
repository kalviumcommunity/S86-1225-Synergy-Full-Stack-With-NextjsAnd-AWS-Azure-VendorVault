// Minimal API route handlers for vendor file upload (placeholders)
export async function POST(request: Request) {
  try {
    const formData = await request.formData().catch(() => new FormData());
    // Placeholder: normally you'd handle file upload here
    const fileCount = Array.from(formData.entries()).length;
    return new Response(
      JSON.stringify({ ok: true, uploaded: true, files: fileCount }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ ok: true, message: "Vendor upload endpoint" }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}
