import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness probe for the container healthcheck and uptime monitoring. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "paicv3", ts: Date.now() });
}
