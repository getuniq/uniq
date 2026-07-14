// Integrations — the stack-position page. Doctrine from the GTM-stack research:
// the light paths win (Clay HTTP column, n8n HTTP-Request templates, MCP with
// EXAMPLE PROMPTS — the artifact almost no vendor ships). We compose with the
// stack (Swan framing), never claim to replace it.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations — Uniq in your GTM stack",
  description: "Drop Uniq into Clay, n8n, Claude Code, Cursor, or any agent stack — recipes included.",
};

export default function Integrations() {
  return (
    <div className="lp">
      <nav className="nav">
        <a className="logo" href="/" aria-label="Uniq">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="uniq." height={34} />
        </a>
        <div className="links">
          <a href="/#how">How it works</a>
          <a href="/pricing">Pricing</a>
          <a className="gh" href="https://github.com/getuniq/uniq">GitHub ★</a>
        </div>
      </nav>

      <header className="hero" style={{ paddingBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>Uniq owns the <em>proposal step</em>.<br />Your stack owns the rest.</h1>
        <p className="sub">Research (Clay, Apollo, your agent) → <strong>artifact (Uniq)</strong> → delivery (Instantly, Smartlead, CRM) → signal (webhook → follow-up).</p>
      </header>

      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <div className="integ-block" id="claude">
          <h3>Claude Code / Claude / Cursor — via MCP</h3>
          <p>One link, no install. Add the server, then talk to it. Example prompts that work verbatim:</p>
          <pre>{`# add the server (Claude Code)
claude mcp add --transport http uniq https://uniq.team/api/mcp \\
  --header "Authorization: Bearer $UNIQ_API_KEY"

# then, in conversation:
"Create a proposal: seller uniq.team, prospect acme.com,
 focus on their agency clients. Give me the email + page link."

"Shorten that email to 80 words and make the CTA softer."   # → edit_artifact

"Any views on that proposal yet?"                            # → get_engagement`}</pre>
        </div>

        <div className="integ-block" id="clay">
          <h3>Clay — HTTP API enrichment column</h3>
          <p>
            Add an <strong>HTTP API</strong> column to your table (or describe it to Clay&apos;s AI setup and it
            auto-maps). Store the key as a saved header account — not inline. One proposal per row:
          </p>
          <pre>{`POST https://uniq.team/api/proposal
Authorization: Bearer <saved header account>          # never paste keys inline
Content-Type: application/json

{
  "sellerUrl": "yoursaas.com",
  "prospectUrl": "{{Company Domain}}",
  "webhookUrl": "{{your follow-up webhook}}"
}

# map back to columns:
#   proposalUrl        → "Proposal page"
#   email.subject      → "Email subject"
#   email.body         → "Email body"`}</pre>
        </div>

        <div className="integ-block" id="n8n">
          <h3>n8n / Make — HTTP Request node</h3>
          <p>
            No custom node needed. Two copy-paste workflows ship in the repo&apos;s{" "}
            <a href="https://github.com/getuniq/uniq/tree/main/examples">examples/</a>: new CRM deal →
            closing kit → Slack, and positive reply (Instantly/Smartlead) → proposal → send on reply.
          </p>
          <pre>{`# the node, minimally:
Method   POST
URL      https://uniq.team/api/proposal
Auth     Header — Authorization: Bearer {{$env.UNIQ_API_KEY}}
Body     { "sellerUrl": "yoursaas.com", "prospectUrl": "{{$json.domain}}" }

# downstream nodes get: proposalUrl, email.subject, email.body, pitchHtml`}</pre>
        </div>

        <div className="integ-block" id="webhook">
          <h3>The follow-up trigger — proposal.viewed</h3>
          <p>Pass <code>webhookUrl</code> when creating; the first open of the hosted page POSTs back. Point it at n8n, Make, Zapier, or your agent:</p>
          <pre>{`{
  "event": "proposal.viewed",
  "proposal_id": "x7k2m9q4p",
  "prospect_domain": "acme.com",
  "at": "2026-07-14T18:22:41Z"
}
# the highest-intent moment in outbound — follow up NOW`}</pre>
        </div>

        <div className="integ-block" id="cli">
          <h3>CLI — any pipeline, any language</h3>
          <pre>{`npx @getuniq/cli propose --seller yoursaas.com --prospect acme.com
# JSON to stdout → jq, files, queues, whatever your stack speaks`}</pre>
        </div>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Uniq — proudly open source</span>
        <span><a href="https://github.com/getuniq/uniq">GitHub</a> · <a href="/llms.txt">llms.txt</a> · <a href="/pricing">Pricing</a></span>
      </footer>
    </div>
  );
}
