// Minimal API route handlers for license approval (placeholders)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    // Placeholder: normally you'd validate and process approval here
    return new Response(JSON.stringify({ ok: true, received: body }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ ok: true, message: "License approve endpoint" }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}
