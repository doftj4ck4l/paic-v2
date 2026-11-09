import { NextResponse } from "next/server";
import { getDevMailbox, isDevMailboxEnabled } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Development-only mailbox: when SMTP is not configured, emails sent by the
 * auth flows (reset / verification links) are captured here so they can be
 * inspected locally and in end-to-end tests.
 *
 * Must be explicitly enabled with DEV_MAILBOX=1 — never enable in production.
 */
export async function GET() {
  if (process.env.DEV_MAILBOX !== "1" || !isDevMailboxEnabled()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  return NextResponse.json({ emails: getDevMailbox() });
}
