import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const cookie = req.headers.get("cookie") ?? "";

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/agent/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body,
    });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }

  if (!backendRes.ok || !backendRes.body) {
    return new NextResponse(backendRes.body, { status: backendRes.status });
  }

  return new NextResponse(backendRes.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
