// /llms.txt — agent-first docs. This is a first-class product surface:
// agents that read this page must be able to use Uniq without human help.

export function GET(): Response {
  const body = `# Uniq

> The open-source, agent-native proposal engine. Two URLs in, a closing kit out:
> a personalized email, a self-contained HTML pitch page, and a hosted proposal
> page rendered in the prospect's own branding. AGPL-3.0. https://uniq.team

## What Uniq does

Give it a seller URL (your product) and a prospect URL (who you're selling to).
It crawls both, builds a persistent seller profile and a per-proposal prospect
brief (including brand extraction: colors, typography, logo), then generates one
narrative expressed as three artifacts:

1. email — the hook. Plain text, 90-140 words, teases the proposal (no raw link; share on reply).
2. pitch_html — the pitch. A complete self-contained HTML one-pager in the prospect's brand.
3. hosted proposal page — the close. Trackable page at /p/{id} in the prospect's branding.

## MCP (preferred agent surface)

Endpoint: https://uniq.team/api/mcp (streamable HTTP; also self-hostable).
Tools:
- create_proposal(seller_url, prospect_url, focus?) → { proposal_id, hosted_proposal_url, email_subject, email_body, narrative }
- get_proposal(proposal_id) → full kit including pitch_html
- get_engagement(proposal_id) → { views }

## REST API

POST /api/proposal        { "sellerUrl": "...", "prospectUrl": "...", "focus": "optional steer" }
  → { id, proposalUrl, email: {subject, body}, pitchHtml, narrative, prospect }
GET  /api/proposal?id=ID                → the stored kit
GET  /api/proposal?id=ID&engagement=1   → { id, views }

Auth: none on self-host by default; hosted/cloud requires Authorization: Bearer <key>.
Generation takes 30-90s (three model calls + two crawls). Seller profiles are cached
by domain — the first call for a seller is the slow one.

## CLI

npx @getuniq/cli propose --seller yoursaas.com --prospect acme.com
  → prints the kit as JSON (pipe into n8n / Make / Clay / any pipeline)

## Self-host

git clone https://github.com/getuniq/uniq && cd uniq && npm install
ANTHROPIC_API_KEY=sk-... npm run dev
Optional: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for persistent proposals,
UNIQ_API_KEY to require auth, UNIQ_BASE_URL for hosted page links.

## Good practices for agents

- Reuse the seller: pass the same seller_url across proposals; the profile is cached.
- Use focus to steer positioning per prospect segment.
- Never paste the hosted URL into a cold email — tease it, share the link on reply.
- Poll get_engagement after sending; views > 0 is your signal to follow up.
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
