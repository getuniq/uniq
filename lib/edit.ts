// Prompt-based artifact editing — the conversational-editing layer.
// One instruction, one artifact, regenerated in place. Agents iterate on a
// proposal exactly like a human would ("shorten the email", "lead with the
// API angle", "make the pricing section concrete").

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { ClosingKitSchema, type ClosingKit } from "./generate";
import { getProposal, saveProposalKit } from "./store";

const MODEL = process.env.UNIQ_MODEL ?? "claude-sonnet-5";

export type EditableArtifact = "email" | "pitch_html" | "proposal";

const EmailSchema = ClosingKitSchema.shape.email;
const PitchSchema = z.object({ pitch_html: z.string().min(200) });
const ProposalSchema = ClosingKitSchema.shape.proposal;

export async function editArtifact(
  proposalId: string,
  artifact: EditableArtifact,
  instruction: string,
): Promise<{ id: string; artifact: EditableArtifact; kit: ClosingKit }> {
  const rec = await getProposal(proposalId);
  if (!rec) throw new Error(`No proposal ${proposalId}`);

  const client = new Anthropic();
  const kit = rec.kit;

  const context =
    `NARRATIVE (the shared thesis — keep all artifacts consistent with it):\n${kit.narrative}\n\n` +
    `SELLER: ${JSON.stringify(rec.seller_profile)}\n` +
    `PROSPECT: ${JSON.stringify(rec.prospect_brief)}\n`;

  const targets: Record<EditableArtifact, { current: unknown; shape: string; schema: z.ZodTypeAny }> = {
    email: {
      current: kit.email,
      shape: `{ "subject": "...", "body": "..." }`,
      schema: EmailSchema,
    },
    pitch_html: {
      current: kit.pitch_html,
      shape: `{ "pitch_html": "complete self-contained HTML document, inline CSS only, prospect brand tokens preserved" }`,
      schema: PitchSchema,
    },
    proposal: {
      current: kit.proposal,
      shape: `same JSON structure as the current proposal object`,
      schema: ProposalSchema,
    },
  };
  const t = targets[artifact];

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: artifact === "pitch_html" ? 6000 : 3000,
      messages: [{
        role: "user",
        content:
          `You are editing ONE artifact of a sales proposal. Apply the instruction faithfully; ` +
          `change nothing the instruction doesn't require; keep the artifact grounded in the ` +
          `narrative and true to the seller/prospect facts.\n\n${context}\n` +
          `CURRENT ${artifact.toUpperCase()}:\n${JSON.stringify(t.current)}\n\n` +
          `INSTRUCTION: ${instruction}\n\n` +
          `Return ONLY valid JSON: ${t.shape}` +
          (attempt > 1 ? `\n\nATTEMPT ${attempt}/3 — previous output failed validation (${String(lastErr).slice(0, 150)}). Raw JSON only.` : ""),
      }],
    });
    const block = res.content.find((b) => b.type === "text");
    const raw = (block && "text" in block ? block.text : "").trim()
      .replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
    try {
      const parsed = t.schema.parse(JSON.parse(raw));
      const nextKit: ClosingKit = { ...kit };
      if (artifact === "email") nextKit.email = parsed as ClosingKit["email"];
      else if (artifact === "pitch_html") nextKit.pitch_html = (parsed as { pitch_html: string }).pitch_html;
      else nextKit.proposal = parsed as ClosingKit["proposal"];
      await saveProposalKit(proposalId, nextKit);
      return { id: proposalId, artifact, kit: nextKit };
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`Edit failed validation after 3 attempts: ${String(lastErr).slice(0, 200)}`);
}
