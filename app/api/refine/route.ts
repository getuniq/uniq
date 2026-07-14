// POST /api/refine — the pitch-refinement interviewer (platform moat #2).
// A short, warm-but-probing interview that sharpens the seller's cached
// profile: ICP, differentiation, the objection they actually hear, the CTA
// that converts. Every future kit generates from the refined profile — the
// compounding, cloud-side intelligence a public prompt can't replicate.
// Auth: user API key (their profile is keyed by their domain).

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { resolveApiKey } from "@/lib/users";
import { getSellerProfile, saveSellerProfile } from "@/lib/store";
import { SellerProfileSchema } from "@/lib/generate";

export const maxDuration = 120;
const MODEL = process.env.UNIQ_MODEL ?? "claude-sonnet-5";

const TurnSchema = z.object({
  action: z.enum(["ask", "finalize"]),
  question: z.string().optional(),
  profile_updates: SellerProfileSchema.partial().optional(),
  summary: z.string().optional(), // what changed, shown to the user on finalize
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await resolveApiKey(req.headers.get("authorization"));
  if (auth.kind !== "user" && auth.kind !== "admin" && auth.kind !== "anon") {
    return NextResponse.json({ error: "Unauthorized — sign up at uniq.team/start" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({})) as {
    domain?: string; messages?: Array<{ role: "user" | "assistant"; content: string }>;
  };
  const domain = auth.kind === "user" ? auth.user.domain : body.domain;
  if (!domain) return NextResponse.json({ error: "domain is required" }, { status: 400 });
  const profile = await getSellerProfile(domain);
  if (!profile) return NextResponse.json({ error: "No seller profile yet — run /start first" }, { status: 404 });

  const messages = (body.messages ?? []).slice(-16);
  const client = new Anthropic();
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system:
      `You are Uniq's pitch-refinement interviewer — warm but probing, one question per turn. ` +
      `The seller's CURRENT profile (auto-extracted from their website):\n${JSON.stringify(profile)}\n\n` +
      `Your job: sharpen this profile through a SHORT interview (4-6 questions total, then finalize). ` +
      `Probe where the auto-extraction is weakest: (1) the real ICP — who actually buys fastest, ` +
      `(2) differentiation — "what do you do that your closest competitor genuinely can't", ` +
      `(3) the objection they hear most and their honest answer, (4) the CTA that actually converts ` +
      `(call? pilot? trial?), (5) pricing reality vs the website. Laddering rules: first answers are ` +
      `polished versions — when an answer is abstract, push once for a concrete example or number. ` +
      `Never flatter. One question at a time.\n\n` +
      `Respond ONLY with JSON: {"action":"ask","question":"..."} to continue, or ` +
      `{"action":"finalize","profile_updates":{...only changed SellerProfile fields...},` +
      `"summary":"2-3 sentences on what got sharper"} when you have enough (or the user asks to finish). ` +
      `profile_updates must preserve truth — only encode what the seller actually said.`,
    messages: messages.length ? messages : [{ role: "user", content: "I'm ready — interview me." }],
  });
  const block = res.content.find((c) => c.type === "text");
  const raw = (block && "text" in block ? block.text : "").trim().replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
  let turn;
  try { turn = TurnSchema.parse(JSON.parse(raw)); }
  catch { return NextResponse.json({ action: "ask", question: "Sorry, hiccup on my side — could you repeat that?" }); }

  if (turn.action === "finalize" && turn.profile_updates) {
    const updated = { ...profile, ...turn.profile_updates, brand: profile.brand ?? turn.profile_updates.brand };
    await saveSellerProfile(domain, updated);
    return NextResponse.json({ action: "finalize", summary: turn.summary ?? "Profile updated.", profile: updated });
  }
  return NextResponse.json({ action: "ask", question: turn.question ?? "Tell me more about who buys fastest." });
}
