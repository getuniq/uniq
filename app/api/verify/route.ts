// POST /api/verify — { email, code } → activates the account's API key.

import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/users";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({})) as { email?: string; code?: string };
  if (!body.email || !body.code) return NextResponse.json({ error: "email and code are required" }, { status: 400 });
  const user = await verifyUser(body.email, body.code);
  if (!user) return NextResponse.json({ error: "Wrong code — check the email we sent you" }, { status: 400 });
  return NextResponse.json({
    apiKey: user.api_key,
    email: user.email,
    domain: user.domain,
    freeProposals: user.proposals_cap - user.proposals_used,
  });
}
