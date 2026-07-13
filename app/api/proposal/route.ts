// POST /api/proposal — the two-URL flow.
// Body: { sellerUrl, prospectUrl, focus?, refreshSeller? }
// Auth: optional — set UNIQ_API_KEY to require `Authorization: Bearer <key>`;
// unset (self-host default) the API is open on your own infrastructure.

import { NextRequest, NextResponse } from "next/server";
import { createProposal } from "@/lib/engine";
import { getProposal, getEngagement } from "@/lib/store";

export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const required = process.env.UNIQ_API_KEY;
  if (!required) return true;
  return req.headers.get("authorization") === `Bearer ${required}`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({})) as {
    sellerUrl?: string; prospectUrl?: string; focus?: string; refreshSeller?: boolean;
  };
  if (!body.sellerUrl || !body.prospectUrl) {
    return NextResponse.json({ error: "sellerUrl and prospectUrl are required" }, { status: 400 });
  }
  try {
    const result = await createProposal({
      sellerUrl: body.sellerUrl,
      prospectUrl: body.prospectUrl,
      focus: body.focus,
      refreshSeller: body.refreshSeller,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}

// GET /api/proposal?id=… — fetch a generated kit (or ?id=…&engagement=1 for view stats)
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  if (req.nextUrl.searchParams.get("engagement")) {
    const eng = await getEngagement(id);
    return eng ? NextResponse.json(eng) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const p = await getProposal(id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: p.id,
    proposalUrl: `${req.nextUrl.origin}/p/${p.id}`,
    email: p.kit.email,
    pitchHtml: p.kit.pitch_html,
    narrative: p.kit.narrative,
    views: p.views,
  });
}
