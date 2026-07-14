// GET /api/me — the account view: your proposals, views, and questions.
// Auth: your API key. Powers /dashboard.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveApiKey } from "@/lib/users";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await resolveApiKey(req.headers.get("authorization"));
  if (auth.kind !== "user") return NextResponse.json({ error: "Unauthorized — use your uq_ API key" }, { status: 401 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "No database configured" }, { status: 500 });
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: proposals } = await db
    .from("uniq_proposals")
    .select("id, prospect_domain, views, created_at")
    .eq("seller_domain", auth.user.domain)
    .order("created_at", { ascending: false })
    .limit(50);

  const ids = (proposals ?? []).map((p) => p.id as string);
  const { data: questions } = ids.length
    ? await db.from("uniq_questions").select("proposal_id, question, email, created_at").in("proposal_id", ids).order("created_at", { ascending: false }).limit(100)
    : { data: [] };

  return NextResponse.json({
    email: auth.user.email,
    domain: auth.user.domain,
    remaining: auth.user.proposals_cap - auth.user.proposals_used,
    proposals: (proposals ?? []).map((p) => ({
      ...p,
      url: `https://uniq.team/p/${p.id}`,
      questions: (questions ?? []).filter((q) => q.proposal_id === p.id),
    })),
  });
}
