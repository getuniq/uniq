// POST /api/ask — the two-way proposal page (platform moat #1).
// A prospect asks a question ON the hosted page → stored + webhooked to the
// seller/agent as `proposal.question` — a buying signal stronger than a view.

import { NextRequest, NextResponse } from "next/server";
import { getProposal, newId } from "@/lib/store";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({})) as { id?: string; question?: string; email?: string };
  const q = body.question?.trim();
  if (!body.id || !q || q.length < 3) return NextResponse.json({ error: "id and question are required" }, { status: 400 });
  if (q.length > 1000) return NextResponse.json({ error: "Question too long" }, { status: 400 });

  const p = await getProposal(body.id);
  if (!p) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    const db = createClient(url, key, { auth: { persistSession: false } });
    await db.from("uniq_questions").insert({
      id: newId(),
      proposal_id: body.id,
      question: q.slice(0, 1000),
      email: body.email?.trim().slice(0, 200) || null,
    });
  }

  // The question webhook — a reply-intent signal the seller's agent acts on NOW.
  if (p.webhook_url) {
    fetch(p.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "proposal.question",
        proposal_id: body.id,
        prospect_domain: p.prospect_domain,
        question: q.slice(0, 1000),
        email: body.email ?? null,
        at: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => undefined);
  }

  return NextResponse.json({ ok: true, message: `${p.seller_profile.company} will get back to you shortly.` });
}
