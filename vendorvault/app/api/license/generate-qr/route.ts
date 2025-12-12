// Minimal API route handlers for QR generation (placeholders)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    // Placeholder: normally you'd generate QR code here
    return new Response(
      JSON.stringify({ ok: true, qr: "placeholder", received: body }),
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
    JSON.stringify({ ok: true, message: "Generate QR endpoint" }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}
