<p align="center">
  <a href="https://uniq.team">
    <img src=".github/assets/banner.svg" alt="Uniq — two URLs in, a closing kit out" width="920" />
  </a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/AGPL-3.0"><img src="https://img.shields.io/badge/license-AGPL--3.0-7C3AED" alt="AGPL-3.0" /></a>
  <a href="https://uniq.team/api/mcp"><img src="https://img.shields.io/badge/MCP-remote%20server-10B981" alt="MCP" /></a>
  <a href="https://www.npmjs.com/package/@getuniq/cli"><img src="https://img.shields.io/badge/CLI-%40getuniq%2Fcli-0E1116" alt="CLI" /></a>
  <a href="https://uniq.team/llms.txt"><img src="https://img.shields.io/badge/docs-llms.txt-A78BFA" alt="llms.txt" /></a>
</p>

<p align="center">
  <b>🤖 Agent-native from day one:</b> works inside <b>Claude Code · Claude · Cursor · Clay · n8n</b> — one MCP link or one HTTP call.
</p>

<h3 align="center">Two URLs in. A closing kit out.</h3>

<p align="center">
Give Uniq your website and your prospect's website. It returns a <b>personalized email</b>, an <b>HTML pitch page</b>, and a <b>hosted proposal wearing the prospect's own brand</b> — their colors, their type, their logo.<br/>
An alternative to: GenPage, Flint, Sendr, Qwilr templates — but open source and built for agents.
</p>

<p align="center">
  <a href="https://uniq.team">Website</a> ·
  <a href="https://uniq.team/integrations">Integrations</a> ·
  <a href="https://uniq.team/pricing">Cloud</a> ·
  <a href="https://uniq.team/llms.txt">Agent docs</a> ·
  <a href="https://uniq.team/p/on6e1uf29">See a real generated proposal →</a>
</p>

---

## Why

Outbound is moving from humans-with-tools to **agents-with-workflows**. Your Clay tables and Claude-based SDR stacks can research and sequence — but they have no **proposal-grade artifact layer**. Nothing turns research into a branded, trackable closing asset. Uniq is that layer:

```
> connect mcp.uniq.team
> create_proposal seller_url=yoursaas.com prospect_url=acme.com

→ ✉  the email    — the hook, in your voice, anchored on something true about them
→ ▤  the pitch    — self-contained HTML one-pager in THEIR brand
→ ◈  the close    — hosted, trackable proposal page: uniq.team/p/x7k2m9q4p
```

The magic is **prospect-brand extraction**: Uniq crawls the prospect's site and every artifact ships in *their* colors, typography, and logo — like your proposal came from a designer who studied them. [Watch it live on the homepage.](https://uniq.team)

## Quick start (self-host — free forever)

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

| Env | What |
|---|---|
| `ANTHROPIC_API_KEY` | required — generation runs on Claude |
| `UNIQ_MODEL` | model override (default `claude-sonnet-5`) |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | persistent profiles/proposals (else in-memory) |
| `UNIQ_API_KEY` | require `Authorization: Bearer` on API + MCP |
| `UNIQ_BASE_URL` | public base URL for hosted proposal links |

## The engine

1. **Seller profile** *(one-time, cached by domain)* — value props, offer structure, proof points, pricing logic, voice.
2. **Prospect ingestion** *(per proposal)* — what they do, pain hypotheses, buying triggers + **brand extraction** (colors, heading font, logo).
3. **One narrative, three artifacts** — email / pitch HTML / hosted proposal page, all expressing one thesis.
4. **Prompt-based editing** — `edit_artifact("shorten the email", …)` regenerates one artifact, keeps the narrative.
5. **Engagement back to the agent** — first page open fires a `proposal.viewed` webhook: the follow-up trigger.

## Agent surfaces

| Surface | How |
|---|---|
| **MCP** | `https://uniq.team/api/mcp` — `create_proposal` · `edit_artifact` · `get_proposal` · `get_engagement` |
| **REST** | `POST /api/proposal` · `POST /api/edit` · `GET /api/proposal?id=…&engagement=1` |
| **CLI** | `npx @getuniq/cli propose --seller yoursaas.com --prospect acme.com` → JSON |
| **Clay** | HTTP API enrichment column — [recipe](examples/README.md#clay) |
| **n8n / Make** | HTTP Request node — [importable workflows](examples/) |
| **Agent docs** | [`llms.txt`](https://uniq.team/llms.txt) — written for agents, works without a human |

Example prompts that work verbatim in Claude Code / Cursor: see [`examples/`](examples/README.md).

## Open source vs cloud

The **entire generation engine is AGPL and identical** in self-host and cloud — crawl, brand extraction, generation, editing, self-hosted pages, webhooks, BYO key. The [cloud](https://uniq.team/pricing) adds hosted pages on **your custom domain**, engagement analytics beyond views, teams/multi-brand, and the managed MCP endpoint. Honest per-proposal pricing — no credits.

## Status

Early and moving fast. The engine is live — [generate a kit on the homepage](https://uniq.team) or open [a real proposal it built](https://uniq.team/p/on6e1uf29). If you run outbound through Clay/n8n/agent stacks and want the artifact step: open an issue, or gal@uniq.team.

## License

[AGPL-3.0](LICENSE) © Uniq
