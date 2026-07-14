// POST /api/edit — prompt-based artifact editing (conversational editing).
// Body: { id, artifact: "email" | "pitch_html" | "proposal", instruction }

import { NextRequest, NextResponse } from "next/server";
import { editArtifact, type EditableArtifact } from "@/lib/edit";

export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const required = process.env.UNIQ_API_KEY;
  if (!required) return true;
  return req.headers.get("authorization") === `Bearer ${required}`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({})) as {
    id?: string; artifact?: string; instruction?: string;
  };
  if (!body.id || !body.artifact || !body.instruction) {
    return NextResponse.json({ error: "id, artifact, and instruction are required" }, { status: 400 });
  }
  if (!["email", "pitch_html", "proposal"].includes(body.artifact)) {
    return NextResponse.json({ error: "artifact must be email | pitch_html | proposal" }, { status: 400 });
  }
  try {
    const r = await editArtifact(body.id, body.artifact as EditableArtifact, body.instruction);
    return NextResponse.json({
      id: r.id,
      artifact: r.artifact,
      email: r.kit.email,
      ...(r.artifact === "pitch_html" ? { pitchHtml: r.kit.pitch_html } : {}),
      ...(r.artifact === "proposal" ? { proposal: r.kit.proposal } : {}),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
