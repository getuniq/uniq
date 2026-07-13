# Uniq

**Two URLs in, a closing kit out.**

Give Uniq your website and your prospect's website. It returns a **personalized email**, an **HTML pitch page**, and a **hosted proposal page in the prospect's own branding** — operable by humans, or by any agent via **MCP, API, and CLI**.

Uniq is the open-source, agent-native proposal engine: the **artifact layer of the outbound agent stack**. Your Clay tables, n8n flows, and Claude-based SDR agents can research and sequence — Uniq turns that research into something a buyer can say yes to.

```
> connect mcp.uniq.team
> create_proposal seller_url=yoursaas.com prospect_url=acme.com

→ email (the hook) + pitch.html (the pitch) + uniq.team/p/x7k2m9q4p (the close)
  ...rendered in Acme's own brand colors, typography, and logo.
```

## How it works

1. **Seller profile** (one-time, cached by domain) — Uniq crawls your site and extracts your value props, offer structure, proof points, pricing logic, and voice.
2. **Prospect ingestion** (per proposal) — crawls the prospect: what they do, pain hypotheses, buying triggers, and **brand extraction** (primary/accent colors, heading font, logo).
3. **Generation — one narrative, three artifacts:**
   - **Email** — 90–140 words in your voice, anchored on something true about them. Teases the proposal; the link goes out on reply (deliverability reality, not vibes).
   - **Pitch** — a complete, self-contained HTML one-pager in *their* branding.
   - **Proposal page** — hosted at `/p/{id}`, trackable, in their branding: problem → solution → deliverables → proof → pricing → CTA.
4. **Engagement** — views flow back to you (or your agent) via `get_engagement`.

## Quick start (self-host)

```bash
git clone https://github.com/getuniq/uniq
cd uniq && npm install
ANTHROPIC_API_KEY=sk-... npm run dev     # http://localhost:3007
```

```bash
curl -X POST localhost:3007/api/proposal \
  -H 'Content-Type: application/json' \
  -d '{"sellerUrl":"yoursaas.com","prospectUrl":"acme.com"}'
```

Optional env:

| Var | What |
|---|---|
| `ANTHROPIC_API_KEY` | required — generation runs on Claude |
| `UNIQ_MODEL` | model override (default `claude-sonnet-5`) |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | persistent profiles + proposals (without it: in-memory) |
| `UNIQ_API_KEY` | require `Authorization: Bearer` on the API |
| `UNIQ_BASE_URL` | public base URL used in hosted proposal links |

## Agent surfaces

- **MCP** — `/api/mcp` (streamable HTTP). Tools: `create_proposal`, `get_proposal`, `get_engagement`. One link, works in Claude, Cursor, ChatGPT, or your own agent loop.
- **REST** — `POST /api/proposal`, `GET /api/proposal?id=…[&engagement=1]`.
- **CLI** — `npx @getuniq/cli propose --seller yoursaas.com --prospect acme.com` → JSON out, pipe anywhere.
- **Docs for agents** — [`/llms.txt`](https://uniq.team/llms.txt).

## Open source & cloud

The full engine — crawl, brand extraction, generation, self-hosted proposal pages — is **AGPL-3.0** and yours forever, BYO Anthropic key. The hosted cloud (uniq.team) adds hosted proposal pages with custom domains, engagement analytics beyond views, teams, CRM integrations, and a managed MCP endpoint.

## Status

Early. The engine works end-to-end; we're running artifact-quality and agent-demand validation right now. If you run outbound through Clay/n8n/agent stacks and want the artifact step — open an issue or say hi: gal@uniq.team.

## License

[AGPL-3.0](LICENSE) © Uniq
