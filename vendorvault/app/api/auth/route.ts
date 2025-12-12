// Minimal API route handlers (placeholders)
export async function GET() {
  return new Response(
    JSON.stringify({ ok: true, message: "Auth GET placeholder" }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
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
