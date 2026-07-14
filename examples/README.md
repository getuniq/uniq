# Uniq in your stack — copy-paste recipes

The proposal step, dropped into the tools you already run. Full guides: [uniq.team/integrations](https://uniq.team/integrations).

## n8n

- [`n8n-deal-to-proposal.json`](n8n-deal-to-proposal.json) — trigger (swap in your CRM trigger) → Uniq closing kit → Slack. Import via n8n → Workflows → Import from file. Set `UNIQ_API_KEY` in n8n env. Timeout is set to 300s — generation takes 30–90s.
- Positive-reply variant: replace the trigger with your Instantly/Smartlead reply webhook and send `email.body` back on the thread with the `proposalUrl`.

## Clay

Add an **HTTP API enrichment column** (or describe it to Clay's AI setup):

```
POST https://uniq.team/api/proposal
Authorization: Bearer <use a SAVED header account, never inline>
{ "sellerUrl": "yoursaas.com", "prospectUrl": "{{Company Domain}}" }
```

Map `proposalUrl`, `email.subject`, `email.body` back to columns. One proposal per row.

## Claude Code / Cursor (MCP)

```bash
claude mcp add --transport http uniq https://uniq.team/api/mcp \
  --header "Authorization: Bearer $UNIQ_API_KEY"
```

Prompts that work verbatim:
- "Create a proposal: seller uniq.team, prospect acme.com, focus on their agency clients."
- "Shorten that email to 80 words." (`edit_artifact`)
- "Any views yet?" (`get_engagement`)

## The follow-up trigger

Pass `webhookUrl` on create — the first open of the hosted page POSTs `{ "event": "proposal.viewed", ... }` to it. Point it at n8n/Make/Zapier/your agent and follow up at the highest-intent moment.
