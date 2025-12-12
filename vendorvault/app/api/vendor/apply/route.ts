// Minimal API route handlers for vendor application (placeholders)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    // Placeholder: normally you'd process vendor application here
    return new Response(
      JSON.stringify({ ok: true, applied: true, received: body }),
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
    JSON.stringify({ ok: true, message: "Vendor apply endpoint" }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}
