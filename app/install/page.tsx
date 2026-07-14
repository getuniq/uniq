// /install — how to run Uniq, every way: cloud key, MCP per client, CLI,
// API, self-host. Postiz-style docs page: copy-paste first, prose second.

import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Install Uniq — MCP, CLI, API, self-host",
  description: "Add Uniq to Claude Code, Cursor, Clay, n8n — or self-host the AGPL engine in 3 commands.",
};

export default function Install() {
  return (
    <div className="lp">
      <SiteNav />

      <header className="hero" style={{ paddingBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>Running in <em>two minutes</em>.</h1>
        <p className="sub">Grab a free key at <a href="/start">/start</a>, then pick your surface. Or self-host the whole engine — it&apos;s AGPL.</p>
      </header>

      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <div className="integ-block">
          <h3>1 · Claude Code / Claude Desktop / Cursor — MCP</h3>
          <pre>{`# Claude Code
claude mcp add --transport http uniq https://uniq.team/api/mcp \\
  --header "Authorization: Bearer $UNIQ_API_KEY"

# Cursor / Claude Desktop (mcp.json)
{ "mcpServers": { "uniq": {
    "url": "https://uniq.team/api/mcp",
    "headers": { "Authorization": "Bearer uq_..." } } } }

# then just talk:
"Create a proposal: seller yoursaas.com, prospect acme.com."`}</pre>
        </div>

        <div className="integ-block">
          <h3>2 · CLI — any shell, any pipeline</h3>
          <pre>{`export UNIQ_API_KEY=uq_...
npx @getuniq/cli propose --seller yoursaas.com --prospect acme.com
npx @getuniq/cli get --id <proposal_id> --engagement`}</pre>
        </div>

        <div className="integ-block">
          <h3>3 · REST API — one endpoint does the work</h3>
          <pre>{`curl -X POST https://uniq.team/api/proposal \\
  -H "Authorization: Bearer $UNIQ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"sellerUrl":"yoursaas.com","prospectUrl":"acme.com",
       "webhookUrl":"https://your-agent/webhook"}'

# → { id, proposalUrl, email:{subject,body}, pitchHtml, narrative }
# full spec: https://uniq.team/openapi.yaml · agent docs: /llms.txt`}</pre>
        </div>

        <div className="integ-block">
          <h3>4 · Self-host — the whole engine, free forever (AGPL)</h3>
          <pre>{`git clone https://github.com/getuniq/uniq
cd uniq && npm install
ANTHROPIC_API_KEY=sk-... npm run dev     # http://localhost:3007`}</pre>
          <p>Optional env: <code>SUPABASE_URL</code> + <code>SUPABASE_SERVICE_ROLE_KEY</code> (persistence),{" "}
            <code>UNIQ_API_KEY</code> (require auth), <code>UNIQ_BASE_URL</code> (hosted link base),{" "}
            <code>UNIQ_MODEL</code> (default <code>claude-sonnet-5</code>). Deploys anywhere Next.js runs.</p>
        </div>

        <div className="integ-block">
          <h3>5 · In your GTM stack</h3>
          <p>
            Copy-paste recipes for <a href="/for/clay">Clay</a>, <a href="/for/n8n">n8n</a>,{" "}
            <a href="/for/apollo">Apollo</a>, <a href="/for/instantly">Instantly</a>,{" "}
            <a href="/for/hubspot">HubSpot</a> and more → <a href="/integrations">integrations</a>.
            Importable n8n workflows live in <a href="https://github.com/getuniq/uniq/tree/main/examples">examples/</a>.
          </p>
        </div>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Uniq — proudly open source</span>
        <span><a href="https://github.com/getuniq/uniq">GitHub</a> · <a href="/llms.txt">llms.txt</a> · <a href="/pricing">Pricing</a></span>
      </footer>
    </div>
  );
}
