// Remote MCP server — one link, works in Claude/ChatGPT/Cursor/any MCP client.
// Endpoint: /api/mcp (streamable HTTP). Tools mirror the REST API 1:1 so agents
// and humans operate the exact same engine.

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createProposal } from "@/lib/engine";
import { getEngagement, getProposal } from "@/lib/store";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "create_proposal",
      "Generate a closing kit from two URLs: a personalized email, an HTML pitch one-pager, and a hosted proposal page in the prospect's own branding. The seller profile is cached by domain after the first call.",
      {
        seller_url: z.string().describe("The seller's website URL (your product/company)"),
        prospect_url: z.string().describe("The prospect's website URL (who you're selling to)"),
        focus: z.string().optional().describe("Optional steer, e.g. 'lead with the API angle' or 'position for their agency clients'"),
      },
      async ({ seller_url, prospect_url, focus }) => {
        const r = await createProposal({ sellerUrl: seller_url, prospectUrl: prospect_url, focus });
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

export { handler as GET, handler as POST, handler as DELETE };
