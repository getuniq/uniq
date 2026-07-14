// POST /api/signup — { email, sellerUrl } → account + API key + cached seller
// profile. Idempotent on email (returning users get their key back).

import { NextRequest, NextResponse } from "next/server";
import { signupUser } from "@/lib/users";

export const maxDuration = 60;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({})) as { email?: string; sellerUrl?: string };
  if (!body.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!body.sellerUrl) return NextResponse.json({ error: "sellerUrl is required" }, { status: 400 });
  try {
    const domain = new URL(/^https?:\/\//.test(body.sellerUrl) ? body.sellerUrl : `https://${body.sellerUrl}`)
      .hostname.replace(/^www\./, "");
    const user = await signupUser(body.email, domain);
    if (user.verified === false) {
      return NextResponse.json({ needsVerification: true, email: user.email });
    }
    return NextResponse.json({
      apiKey: user.api_key,
      email: user.email,
      domain: user.domain,
      freeProposals: user.proposals_cap - user.proposals_used,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
