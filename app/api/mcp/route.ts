// Remote MCP server — one link, works in Claude/ChatGPT/Cursor/any MCP client.
// Endpoint: /api/mcp (streamable HTTP). Tools mirror the REST API 1:1 so agents
// and humans operate the exact same engine.

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createProposal } from "@/lib/engine";
import { editArtifact } from "@/lib/edit";
import { getEngagement, getProposal } from "@/lib/store";

const mcpHandler = createMcpHandler(
  (server) => {
    server.tool(
      "create_proposal",
      "Generate a closing kit from two URLs: a personalized email, an HTML pitch one-pager, and a hosted proposal page in the prospect's own branding. The seller profile is cached by domain after the first call.",
      {
        seller_url: z.string().describe("The seller's website URL (your product/company)"),
        prospect_url: z.string().describe("The prospect's website URL (who you're selling to)"),
        focus: z.string().optional().describe("Optional steer, e.g. 'lead with the API angle' or 'position for their agency clients'"),
        webhook_url: z.string().optional().describe("URL to POST { event: 'proposal.viewed', proposal_id, prospect_domain, at } when the prospect first opens the hosted page — your follow-up trigger"),
      },
      async ({ seller_url, prospect_url, focus, webhook_url }) => {
        const r = await createProposal({ sellerUrl: seller_url, prospectUrl: prospect_url, focus, webhookUrl: webhook_url });
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              proposal_id: r.id,
              hosted_proposal_url: r.proposalUrl,
              email_subject: r.email.subject,
              email_body: r.email.body,
              narrative: r.narrative,
              prospect: r.prospect,
              note: "pitch_html omitted here for context economy — fetch it with get_proposal.",
            }, null, 2),
          }],
        };
      },
    );

    server.tool(
      "get_proposal",
      "Fetch a previously generated proposal kit by id, including the full pitch HTML.",
      { proposal_id: z.string() },
      async ({ proposal_id }) => {
        const p = await getProposal(proposal_id);
        if (!p) return { content: [{ type: "text" as const, text: `No proposal ${proposal_id}` }], isError: true };
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ id: p.id, email: p.kit.email, narrative: p.kit.narrative, pitch_html: p.kit.pitch_html }, null, 2),
          }],
        };
      },
    );

    server.tool(
      "edit_artifact",
      "Prompt-based editing of one artifact of an existing proposal — 'shorten the email', 'lead with the ROI angle', 'make pricing concrete'. Regenerates only that artifact, keeping the shared narrative.",
      {
        proposal_id: z.string(),
        artifact: z.enum(["email", "pitch_html", "proposal"]).describe("email = the outreach email · pitch_html = the HTML one-pager · proposal = the hosted page content"),
        instruction: z.string().describe("What to change, in plain language"),
      },
      async ({ proposal_id, artifact, instruction }) => {
        const r = await editArtifact(proposal_id, artifact, instruction);
        const payload = artifact === "email" ? r.kit.email
          : artifact === "pitch_html" ? { pitch_html_length: r.kit.pitch_html.length, note: "fetch full HTML with get_proposal" }
          : r.kit.proposal;
        return { content: [{ type: "text" as const, text: JSON.stringify({ id: r.id, artifact, updated: payload }, null, 2) }] };
      },
    );

    server.tool(
      "get_engagement",
      "Engagement stats for a hosted proposal page (views). More dimensions (scroll depth, section dwell) land in the cloud version.",
      { proposal_id: z.string() },
      async ({ proposal_id }) => {
        const eng = await getEngagement(proposal_id);
        if (!eng) return { content: [{ type: "text" as const, text: `No proposal ${proposal_id}` }], isError: true };
        return { content: [{ type: "text" as const, text: JSON.stringify(eng) }] };
      },
    );
  },
  {},
  { basePath: "/api" },
);

// Same auth model as the REST API: open on keyless self-host; hosted accepts
// the admin key OR any user's API key (from the free signup at uniq.team).
async function handler(req: Request): Promise<Response> {
  const { resolveApiKey } = await import("@/lib/users");
  const auth = await resolveApiKey(req.headers.get("authorization"));
  if (auth.kind === "invalid") {
    return new Response(JSON.stringify({ error: "Unauthorized — sign up free at uniq.team for an API key" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return mcpHandler(req);
}

export { handler as GET, handler as POST, handler as DELETE };
