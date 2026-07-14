// The generation engine — one narrative, three artifacts.
// Seller profile (persistent) + prospect brief (per proposal) → personalized
// email, HTML pitch one-pager, and a hosted proposal page in the prospect's
// own branding. All Claude calls are structured-JSON with schema validation.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { CrawledSite } from "./crawl";

const MODEL = process.env.UNIQ_MODEL ?? "claude-sonnet-5";

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const SellerProfileSchema = z.object({
  company: z.string(),
  one_liner: z.string(),
  value_props: z.array(z.string()).min(1).max(6),
  offer_structure: z.string(),          // what they sell and how it's packaged
  proof_points: z.array(z.string()).max(6),
  pricing_logic: z.string(),            // how pricing works, if discoverable
  tone: z.string(),                     // seller's voice for the email
});
export type SellerProfile = z.infer<typeof SellerProfileSchema>;

export const ProspectBriefSchema = z.object({
  company: z.string(),
  what_they_do: z.string(),
  pain_hypotheses: z.array(z.string()).min(1).max(5),
  buying_triggers: z.array(z.string()).max(4),
  brand: z.object({
    primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    heading_font: z.string(),
    logo_url: z.string().nullable(),
  }),
});
export type ProspectBrief = z.infer<typeof ProspectBriefSchema>;

export const ClosingKitSchema = z.object({
  narrative: z.string(),                // the single thesis all 3 artifacts share
  email: z.object({
    subject: z.string(),
    body: z.string(),                   // plain text, ready to send
  }),
  pitch_html: z.string(),               // self-contained HTML one-pager
  proposal: z.object({                  // structured — rendered by our hosted template
    headline: z.string(),
    subheadline: z.string(),
    problem: z.object({ title: z.string(), body: z.string() }),
    solution: z.object({ title: z.string(), body: z.string() }),
    deliverables: z.array(z.object({ title: z.string(), body: z.string() })).min(2).max(5),
    proof: z.array(z.string()).max(4),
    pricing: z.object({ title: z.string(), body: z.string() }),
    cta: z.object({ label: z.string(), sub: z.string() }),
  }),
});
export type ClosingKit = z.infer<typeof ClosingKitSchema>;

// ─── JSON-mode Claude call with retry ─────────────────────────────────────────

async function claudeJSON<T>(prompt: string, schema: z.ZodType<T>, maxTokens = 4000): Promise<T> {
  const client = new Anthropic();
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const suffix = attempt === 1
      ? "\n\nRespond with ONLY valid JSON matching the requested structure. No markdown fences, no commentary."
      : `\n\nATTEMPT ${attempt}/3 — previous output failed validation (${String(lastErr).slice(0, 200)}). Return ONLY raw, valid JSON.`;
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt + suffix }],
    });
    const block = res.content.find((b) => b.type === "text");
    const raw = (block && "text" in block ? block.text : "").trim()
      .replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
    try {
      return schema.parse(JSON.parse(raw));
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`Generation failed schema validation after 3 attempts: ${String(lastErr).slice(0, 300)}`);
}

// ─── Steps ────────────────────────────────────────────────────────────────────

export async function buildSellerProfile(site: CrawledSite): Promise<SellerProfile> {
  return claudeJSON(
    `Build a SELLER PROFILE from this company's website. This profile is reused for every
proposal this seller generates, so extract durable facts, not page copy.

WEBSITE: ${site.url}
TITLE: ${site.title}
DESCRIPTION: ${site.description}
CONTENT:
${site.text}

Extract JSON:
{
  "company": short brand name,
  "one_liner": what they sell, one sentence, concrete,
  "value_props": 2-6 sharp value propositions (specific outcomes, not adjectives),
  "offer_structure": what is actually sold and how it's packaged (product/service/tiers),
  "proof_points": up to 6 real proof points found on the site (numbers, logos, testimonials) — only ones actually present,
  "pricing_logic": how pricing works if discoverable, else "not published",
  "tone": 1-2 sentences describing the seller's voice (for writing emails as them)
}`,
    SellerProfileSchema, 1500);
}

export async function buildProspectBrief(site: CrawledSite): Promise<ProspectBrief> {
  return claudeJSON(
    `Build a PROSPECT BRIEF from this company's website, for a personalized sales proposal
addressed TO them. Also select their brand tokens from the crawled evidence.

WEBSITE: ${site.url}
TITLE: ${site.title}
DESCRIPTION: ${site.description}
CONTENT:
${site.text}

BRAND EVIDENCE (from their HTML/CSS, most-frequent first):
- color candidates: ${site.colorCandidates.join(", ") || "none found"}
- font candidates: ${site.fontCandidates.join(", ") || "none found"}
- logo candidates: ${site.logoCandidates.join(", ") || "none found"}

Extract JSON:
{
  "company": their brand name,
  "what_they_do": one concrete sentence,
  "pain_hypotheses": 2-5 SPECIFIC pains this company plausibly has, grounded in what the site
     reveals (stage, motion, market) — no generic "companies struggle with efficiency",
  "buying_triggers": up to 4 observable triggers (hiring, launch, pricing page signals, stack hints),
  "brand": {
    "primary_color": the hex most likely to be their primary brand color (from candidates; if all
       candidates are weak, infer a tasteful dark neutral like "#111827"),
    "accent_color": a supporting hex from candidates or a compatible complement,
    "heading_font": their heading font from candidates, else "Inter",
    "logo_url": best logo candidate URL, else null
  }
}`,
    ProspectBriefSchema, 1500);
}

export async function generateClosingKit(
  seller: SellerProfile,
  prospect: ProspectBrief,
  proposalUrl: string,
  focus?: string,
): Promise<ClosingKit> {
  return claudeJSON(
    `You are Uniq, an agent-native proposal engine. Produce ONE narrative and THREE artifacts
selling ${seller.company}'s offer to ${prospect.company}.

SELLER PROFILE:
${JSON.stringify(seller, null, 1)}

PROSPECT BRIEF:
${JSON.stringify(prospect, null, 1)}

${focus ? `FOCUS OVERRIDE (from the operator): ${focus}\n` : ""}
THE BAR: every artifact must be so specific to ${prospect.company} that it could not be sent to
any other company. Reference their actual business, their actual pains, in their language.
No placeholder text, no [brackets], no "we help companies like yours".

Return JSON:
{
  "narrative": the single 2-3 sentence thesis connecting ${seller.company}'s offer to ${prospect.company}'s
     specific situation — all three artifacts express THIS,

  "email": {
    "subject": under 55 chars, specific, no clickbait, lowercase-natural,
    "body": 90-140 words, plain text, written in the seller's tone. THE EMAIL'S JOB IS PROOF OF
       WORK, not brand. Structure:
       (1) one VERIFIABLE observation only someone who actually studied ${prospect.company} could
           make — name a real page, pricing choice, launch, or wording from their site;
       (2) the POC: one concrete, specific idea or mini-deliverable they could steal today even
           without ever replying — give real substance, not a teaser;
       (3) the narrative in one line + ONE proof point;
       (4) soft CTA that teases the fuller proposal WITHOUT pasting a link (deliverability: the
           link is shared on reply).
       Sign off as the seller. No "I hope this finds you well". The reader should think
       "they already did work for us" — that is the bar.
  },

  "pitch_html": a COMPLETE self-contained HTML document (inline CSS only, no external requests,
     no javascript) — a one-page pitch that looks like ${prospect.company}'s own design team made
     it. Brand tokens: primary ${prospect.brand.primary_color}, accent ${prospect.brand.accent_color},
     headings '${prospect.brand.heading_font}', system fallbacks. DESIGN BAR (non-negotiable):
     hero with a layered gradient built from the two brand colors (e.g. linear-gradient at 135deg
     with a translucent radial overlay), an eyebrow label, oversized headline (clamp 2-3rem);
     deliverables as bordered cards with a 3px brand-color top edge and subtle box-shadow;
     a proof strip on a tinted background (primary color at ~6% opacity); pricing in a bordered
     panel; a pill-shaped CTA button in the primary color with generous padding. Max-width 760px
     centered, 3rem section rhythm, 1.65 line-height, mobile-safe. Restrained wordcount, rich
     visual hierarchy — no walls of text, no generic corporate filler.

  "proposal": {
    "headline": speaks to ${prospect.company}'s outcome, not ${seller.company}'s features,
    "subheadline": one supporting line,
    "problem": { "title", "body" (2-3 sentences naming THEIR specific pain) },
    "solution": { "title", "body" (how the offer lands in their world) },
    "deliverables": 2-5 items { "title", "body" } — concrete, scoped,
    "proof": up to 4 proof points (only real ones from the seller profile),
    "pricing": { "title", "body" } — honest framing of the seller's pricing logic,
    "cta": { "label" (button text), "sub" (reassurance line) }
  }
}

The hosted proposal will live at ${proposalUrl} — the email may reference "a one-pager I put
together for ${prospect.company}" but must not include the raw URL.`,
    ClosingKitSchema, 8000);
}
