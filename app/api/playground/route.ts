// POST /api/playground — the public try-it flow behind the landing page.
// No API key required; protected instead by a small global daily cap
// (UNIQ_PLAYGROUND_DAILY_CAP, default 25) so a public demo can't burn tokens.

import { NextRequest, NextResponse } from "next/server";
import { createProposal } from "@/lib/engine";
import { bumpPlaygroundUsage } from "@/lib/store";

export const maxDuration = 300;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const cap = parseInt(process.env.UNIQ_PLAYGROUND_DAILY_CAP ?? "25", 10) || 25;
  const used = await bumpPlaygroundUsage();
  if (used !== null && used > cap) {
    return NextResponse.json(
      { error: "The free playground hit today's cap. Self-host the engine (github.com/getuniq/uniq) or grab an API key — both take minutes." },
      { status: 429 },
    );
  }
  const body = await req.json().catch(() => ({})) as { sellerUrl?: string; prospectUrl?: string };
  if (!body.sellerUrl || !body.prospectUrl) {
    return NextResponse.json({ error: "sellerUrl and prospectUrl are required" }, { status: 400 });
  }
  try {
    const r = await createProposal({ sellerUrl: body.sellerUrl, prospectUrl: body.prospectUrl });
    return NextResponse.json({
      id: r.id,
      proposalUrl: r.proposalUrl,
      email: r.email,
      narrative: r.narrative,
      prospect: r.prospect,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
