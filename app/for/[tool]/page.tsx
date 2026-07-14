// /for/[tool] — dedicated branded pages for the GTM stack (programmatic-GEO +
// the dogfood move: each page wears THAT tool's aesthetic, exactly like our
// proposals wear the prospect's. Six tools, six visibly different designs.
// "Works with" framing only — names + palettes, no third-party logos.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RevealFx from "@/components/RevealFx";

interface ToolPage {
  name: string;
  slug: string;
  // brand aesthetic
  bg: string; ink: string; brand: string; soft: string; radius: string; font?: string;
  dark: boolean;
  // content
  headline: string; sub: string;
  motif: "table" | "datacard" | "terminal" | "workflow" | "inbox" | "crm";
  layout: "cards" | "steps" | "split";
  benefits: Array<{ title: string; body: string }>;
  snippetTitle: string; snippet: string;
}

const TOOLS: Record<string, ToolPage> = {
  clay: {
    name: "Clay", slug: "clay",
    layout: "steps",
    bg: "#F4F1EA", ink: "#191919", brand: "#191919", soft: "#E8E2D5", radius: "6px", dark: false,
    headline: "The proposal column your Clay table is missing.",
    sub: "Your table already finds them, enriches them, scores them. Uniq is the column that turns each row into a closing kit — email + pitch + a hosted page in that prospect's own brand.",
    motif: "table",
    benefits: [
      { title: "One HTTP column, whole-table proposals", body: "Add an HTTP API enrichment column, point it at /api/proposal, map three fields back. Clay's AI setup can configure it from one sentence." },
      { title: "Every row gets its own brand", body: "Uniq crawls each prospect's site and ships their colors, type, and logo — 500 rows means 500 visibly different proposals, not one template with merge tags." },
      { title: "Views flow back to the table", body: "Pass a webhook per row; proposal.viewed lands back in your workflow the moment they open — your highest-intent signal, in-table." },
    ],
    snippetTitle: "The Clay HTTP column",
    snippet: `POST https://uniq.team/api/proposal
Authorization: Bearer <saved header account>
{ "sellerUrl": "yoursaas.com",
  "prospectUrl": "{{Company Domain}}",
  "webhookUrl": "{{followup webhook}}" }
→ map: proposalUrl · email.subject · email.body`,
  },
  apollo: {
    name: "Apollo", slug: "apollo",
    layout: "cards",
    bg: "#12111F", ink: "#F3F2FA", brand: "#FCD34D", soft: "#1E1C33", radius: "12px", dark: true,
    headline: "Enriched by Apollo. Closed by Uniq.",
    sub: "Apollo tells you who they are. Uniq turns that into what they see: a personalized email and a proposal page in the prospect's own branding — generated from nothing but their URL.",
    motif: "datacard",
    benefits: [
      { title: "Sequence-ready artifacts", body: "Drop Uniq's email into your Apollo sequence as the personalized first touch; the hosted page goes out on reply — deliverability-safe by design." },
      { title: "From contact export to closing kit", body: "Any Apollo list with a domain column becomes a batch of branded proposals via one API loop or the CLI — JSON in, JSON out." },
      { title: "Intent signal you don't have", body: "Apollo scores fit. Uniq's proposal.viewed webhook scores interest — the moment a buyer opens their page, your agent knows." },
    ],
    snippetTitle: "Apollo export → Uniq loop",
    snippet: `cat apollo-export.json | jq -r '.[].domain' | while read d; do
  npx @getuniq/cli propose --seller yoursaas.com --prospect "$d"
done
# → one branded kit per contact, JSON to stdout`,
  },
  oxygen: {
    name: "Oxygen", slug: "oxygen",
    layout: "split",
    bg: "#0A0E0B", ink: "#D7E4DA", brand: "#4ADE80", soft: "#111A14", radius: "8px", dark: true,
    headline: "your gtm cli researches.\nuniq closes.",
    sub: "Oxygen runs your GTM from Claude Code, Codex, and MCP agents. Uniq is the artifact tool-call in that loop — the step that turns agent research into something a buyer signs.",
    motif: "terminal",
    benefits: [
      { title: "MCP-native, like your whole stack", body: "One streamable-HTTP MCP server: create_proposal, edit_artifact, get_engagement. Your agent operates it exactly like Oxygen's own tools." },
      { title: "Composable, not another platform", body: "Uniq does one job — the proposal step. AGPL, self-hostable next to your agent infra, BYO Anthropic key, no lock-in." },
      { title: "Agent-legible by design", body: "llms.txt + OpenAPI + example prompts that work verbatim. Your agent reads the docs and uses the tool — no human in the setup loop." },
    ],
    snippetTitle: "In your agent session",
    snippet: `> claude mcp add --transport http uniq https://uniq.team/api/mcp
> "research acme.com, then create_proposal and
   tell me when they open it"
# agent: researched · kit generated · webhook armed`,
  },
  n8n: {
    name: "n8n", slug: "n8n",
    layout: "cards",
    bg: "#201A23", ink: "#F4EFF6", brand: "#EA4B71", soft: "#2C2430", radius: "14px", dark: true,
    headline: "The node between research and delivery.",
    sub: "Trigger on a new deal, a positive reply, a form fill — one HTTP Request node returns the full closing kit, and the next node delivers it. No custom node to install.",
    motif: "workflow",
    benefits: [
      { title: "Importable workflows, ready to run", body: "Copy-paste JSON workflows in the repo: CRM deal → kit → Slack, and reply-webhook → proposal → send on thread. Set one env var." },
      { title: "The webhook completes the loop", body: "proposal.viewed hits your n8n webhook node — branch on it: instant follow-up, Slack ping, CRM stage change. Outbound becomes a circuit." },
      { title: "JSON-clean outputs", body: "proposalUrl, email.subject, email.body, pitchHtml — flat fields, no parsing gymnastics, mapped straight into downstream nodes." },
    ],
    snippetTitle: "The HTTP Request node",
    snippet: `Method  POST · URL  https://uniq.team/api/proposal
Auth    Header · Authorization: Bearer {{$env.UNIQ_API_KEY}}
Body    { "sellerUrl": "yoursaas.com",
          "prospectUrl": "{{$json.domain}}" }
Timeout 300000   # generation takes 30–90s`,
  },
  instantly: {
    name: "Instantly", slug: "instantly",
    layout: "steps",
    bg: "#F5F8FF", ink: "#101828", brand: "#2F6BFF", soft: "#E3ECFF", radius: "16px", dark: false,
    headline: "Positive reply in. Branded proposal out.",
    sub: "The reply is the moment. Wire Instantly's reply webhook to Uniq and the follow-up carries a proposal page in the prospect's own brand — while the thread is still warm.",
    motif: "inbox",
    benefits: [
      { title: "Reply-triggered generation", body: "Instantly webhook → Uniq API → kit ready before you've read the reply. Send the page link on-thread; that's the deliverability-correct move." },
      { title: "The first touch stays clean", body: "Uniq's email artifact is built for cold: no links, one proof point, one stealable idea. Your sender reputation never meets a URL." },
      { title: "Open = your next trigger", body: "proposal.viewed fires back into your automation — follow up at peak intent instead of on day-3-of-sequence autopilot." },
    ],
    snippetTitle: "Reply webhook → kit",
    snippet: `POST https://uniq.team/api/proposal
{ "sellerUrl": "yoursaas.com",
  "prospectUrl": "{{reply.company_domain}}",
  "webhookUrl": "https://your-n8n/webhook/uniq-viewed" }
# reply to the thread with proposalUrl`,
  },
  hubspot: {
    name: "HubSpot", slug: "hubspot",
    layout: "split",
    bg: "#FFF9F6", ink: "#33475B", brand: "#FF7A59", soft: "#FFE9E1", radius: "10px", dark: false,
    headline: "Every deal stage deserves its own page.",
    sub: "A HubSpot workflow webhook turns 'deal created' into a proposal in the prospect's brand — attached to the record, tracked to the open.",
    motif: "crm",
    benefits: [
      { title: "Workflow-webhook simple", body: "No app to install: a HubSpot workflow's webhook action calls Uniq with the company domain; write proposalUrl back to a deal property." },
      { title: "Reps send, they don't build", body: "The kit arrives finished — email copy and a designed page. Your team's job shrinks to 'review and send', which they actually do." },
      { title: "Opens as deal signals", body: "Route proposal.viewed into a workflow: bump the deal stage, notify the owner, schedule the call. Buying signals beat activity metrics." },
    ],
    snippetTitle: "Workflow webhook action",
    snippet: `POST https://uniq.team/api/proposal
{ "sellerUrl": "yoursaas.com",
  "prospectUrl": "{{company.domain}}",
  "webhookUrl": "{{hubspot workflow webhook}}" }
→ write proposalUrl to deal property`,
  },
  "claude-code": {
    name: "Claude Code", slug: "claude-code", layout: "steps",
    bg: "#16130E", ink: "#F2EDE4", brand: "#D97757", soft: "#241E15", radius: "10px", dark: true,
    headline: "Your coding agent just became\nyour closing agent.",
    sub: "One MCP link and Claude Code researches the prospect, generates the kit, edits it in conversation, and tells you the moment they open it.",
    motif: "terminal",
    benefits: [
      { title: "One command to install", body: "claude mcp add — that's the whole setup. The tools appear in every session; your agent reads /llms.txt and knows the rest." },
      { title: "Conversational editing built in", body: "\u201cShorten the email. Lead with ROI. Make pricing concrete.\u201d — edit_artifact regenerates one artifact, keeps the narrative." },
      { title: "The follow-up loop closes itself", body: "proposal.viewed and proposal.question flow back — ask \u201cany views yet?\u201d mid-session or wire the webhook to your own automation." },
    ],
    snippetTitle: "The whole install",
    snippet: `claude mcp add --transport http uniq https://uniq.team/api/mcp \\
  --header "Authorization: Bearer $UNIQ_API_KEY"

> "research acme.com, create a proposal, tell me when they open it"`,
  },
  cursor: {
    name: "Cursor", slug: "cursor", layout: "split",
    bg: "#0D0D10", ink: "#EDEDEF", brand: "#7DD3FC", soft: "#17171C", radius: "12px", dark: true,
    headline: "Ship code all day.\nClose deals between builds.",
    sub: "Uniq's MCP server drops into Cursor like any dev tool — founders who sell from their editor generate branded proposals without leaving it.",
    motif: "terminal",
    benefits: [
      { title: "mcp.json and done", body: "Add one server entry with your key. Uniq's tools show up next to your linters — create_proposal is just another tool call." },
      { title: "Founder-led sales, editor-native", body: "Prospect replied while you were debugging? Generate the kit in a side chat and paste the page link — 60 seconds, no context switch." },
      { title: "Your product IS the pitch", body: "Uniq crawls your site for the seller profile — ship a feature, refresh the profile, and every next proposal sells the newest version." },
    ],
    snippetTitle: "mcp.json",
    snippet: `{ "mcpServers": { "uniq": {
    "url": "https://uniq.team/api/mcp",
    "headers": { "Authorization": "Bearer uq_..." } } } }`,
  },
  smartlead: {
    name: "Smartlead", slug: "smartlead", layout: "cards",
    bg: "#F4F6FB", ink: "#111B33", brand: "#4F5DFF", soft: "#E5E9FB", radius: "14px", dark: false,
    headline: "Your sequences warm them up.\nUniq closes them down.",
    sub: "Smartlead owns deliverability at scale. When a reply lands, the follow-up carries a proposal page in the prospect's own brand — while the thread is hot.",
    motif: "inbox",
    benefits: [
      { title: "Reply webhook → closing kit", body: "Point Smartlead's webhook at your automation, call Uniq with the replier's domain, answer on-thread with the branded page." },
      { title: "First touch stays link-free", body: "Uniq's cold email carries proof and one stealable idea — no URLs. Your sender reputation and open rates stay intact." },
      { title: "Intent flows back into the sequence", body: "proposal.viewed marks the hottest leads — branch your sequence on it instead of blasting day-3 follow-ups to everyone." },
    ],
    snippetTitle: "Reply webhook → Uniq",
    snippet: `POST https://uniq.team/api/proposal
{ "sellerUrl": "yoursaas.com",
  "prospectUrl": "{{reply.company_domain}}",
  "webhookUrl": "{{your automation webhook}}" }`,
  },
  make: {
    name: "Make", slug: "make", layout: "steps",
    bg: "#F7F3FB", ink: "#2A1B3D", brand: "#8B5CF6", soft: "#EDE4F8", radius: "16px", dark: false,
    headline: "One HTTP module.\nA whole proposal studio.",
    sub: "No custom app needed — Make's HTTP module calls Uniq and every scenario downstream gets the email, the pitch, and the branded page as clean JSON.",
    motif: "workflow",
    benefits: [
      { title: "Drop-in HTTP module", body: "POST /api/proposal with two URLs; map proposalUrl, email.subject, email.body into any downstream module. 300s timeout, that's it." },
      { title: "Trigger from anywhere", body: "New CRM deal, form fill, positive reply, Slack command — any Make trigger becomes a closing-kit generator." },
      { title: "Webhooks complete the circuit", body: "proposal.viewed and proposal.question hit a Make webhook — route to Slack, CRM stage changes, or the follow-up scenario." },
    ],
    snippetTitle: "The HTTP module",
    snippet: `Method  POST · URL  https://uniq.team/api/proposal
Headers Authorization: Bearer {{env.UNIQ_API_KEY}}
Body    { "sellerUrl": "yoursaas.com",
          "prospectUrl": "{{1.company_domain}}" }`,
  },
  zapier: {
    name: "Zapier", slug: "zapier", layout: "cards",
    bg: "#FFF6F0", ink: "#201515", brand: "#FF4F00", soft: "#FFE9DC", radius: "10px", dark: false,
    headline: "Zap in a lead.\nZap out a closing kit.",
    sub: "Webhooks by Zapier is all it takes: any trigger in your 6,000-app universe becomes a branded proposal — and the open becomes your next trigger.",
    motif: "workflow",
    benefits: [
      { title: "Webhooks by Zapier, twice", body: "Action: POST to /api/proposal with the lead's domain. Trigger: catch proposal.viewed / proposal.question and fan out anywhere." },
      { title: "Works with your existing Zaps", body: "Typeform fill → proposal. Calendly booking → proposal before the call. CRM stage change → refreshed kit. No new tools to learn." },
      { title: "Flat JSON out", body: "proposalUrl, email.subject, email.body — maps straight into Gmail drafts, Slack messages, or CRM notes without formatters." },
    ],
    snippetTitle: "Webhooks by Zapier — action",
    snippet: `POST https://uniq.team/api/proposal
Headers  Authorization: Bearer uq_...
Data     sellerUrl: yoursaas.com
         prospectUrl: {{company_domain}}
         webhookUrl: {{catch-hook URL}}`,
  },
  attio: {
    name: "Attio", slug: "attio", layout: "split",
    bg: "#FAFAFA", ink: "#1A1A1A", brand: "#246BFE", soft: "#EBF1FF", radius: "12px", dark: false,
    headline: "A proposal on every record.\nIntent on every open.",
    sub: "Attio workflows call Uniq when a deal advances; the branded page lands back on the record, and opens move the pipeline for you.",
    motif: "crm",
    benefits: [
      { title: "Workflow-native", body: "An Attio workflow webhook posts the company domain to Uniq and writes proposalUrl back to a record attribute — no middleware." },
      { title: "Real-time intent on the timeline", body: "proposal.viewed and prospect questions land as timeline events — your team sees interest the moment it happens." },
      { title: "Data stays clean", body: "One attribute, one URL, no attachments rotting in drives. The page is always the latest version — edits update it in place." },
    ],
    snippetTitle: "Attio workflow webhook",
    snippet: `POST https://uniq.team/api/proposal
{ "sellerUrl": "yoursaas.com",
  "prospectUrl": "{{record.company.domain}}",
  "webhookUrl": "{{attio webhook endpoint}}" }
→ write proposalUrl to the deal record`,
  },
};

export function generateStaticParams() {
  return Object.keys(TOOLS).map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params;
  const t = TOOLS[tool];
  if (!t) return { title: "Uniq" };
  return {
    title: `Uniq for ${t.name} — the proposal step in your ${t.name} workflow`,
    description: t.sub,
  };
}

function Motif({ t }: { t: ToolPage }) {
  const s = { brand: t.brand, soft: t.soft, ink: t.ink };
  switch (t.motif) {
    case "table": // Clay — rows becoming proposals
      return (
        <div className="motif motif-table" aria-hidden>
          {["acme.com", "vantia.io", "polar.dev"].map((d, i) => (
            <div className="trow" key={d} style={{ animationDelay: `${i * 0.35}s` }}>
              <span className="tcell">{d}</span><span className="tcell dim">enriched ✓</span>
              <span className="tcell kit" style={{ color: s.brand }}>→ kit ready · their brand</span>
            </div>
          ))}
        </div>
      );
    case "datacard": // Apollo — contact card → kit
      return (
        <div className="motif motif-data" aria-hidden>
          <div className="dcard1"><strong>Dana Levy</strong><span>VP Growth · acme.com</span><em style={{ color: s.brand }}>fit 94</em></div>
          <div className="darrow" style={{ color: s.brand }}>→</div>
          <div className="dcard2" style={{ borderColor: s.brand }}><strong style={{ color: s.brand }}>closing kit</strong><span>✉ email · ▤ pitch · ◈ page</span><em>in acme&apos;s brand</em></div>
        </div>
      );
    case "terminal": // Oxygen — live terminal
      return (
        <div className="motif motif-term" aria-hidden>
          <div className="tbar"><i /><i /><i /></div>
          <p><span style={{ color: s.brand }}>&gt;</span> create_proposal prospect_url=acme.com</p>
          <p className="dim">crawling… brand extracted: #0099ff · Inter · logo ✓</p>
          <p className="dim">narrative locked · 3 artifacts generated</p>
          <p><span style={{ color: s.brand }}>✓</span> uniq.team/p/x7k2m9q4p <span className="cursor" style={{ background: s.brand }} /></p>
        </div>
      );
    case "workflow": // n8n — connected nodes
      return (
        <div className="motif motif-flow" aria-hidden>
          <span className="node">Trigger</span><i className="wire" style={{ background: s.brand }} />
          <span className="node hot" style={{ borderColor: s.brand, color: s.brand }}>Uniq</span><i className="wire" style={{ background: s.brand }} />
          <span className="node">Deliver</span><i className="wire" style={{ background: s.brand }} />
          <span className="node">viewed → follow up</span>
        </div>
      );
    case "inbox": // Instantly — reply thread
      return (
        <div className="motif motif-inbox" aria-hidden>
          <div className="msg them">&quot;interesting — send me more?&quot;</div>
          <div className="msg you" style={{ background: s.brand }}>Here&apos;s a one-pager we made for Acme → <u>acme&apos;s branded page</u></div>
          <div className="msg sig" style={{ color: s.brand }}>● viewed 2m later — follow up now</div>
        </div>
      );
    case "crm": // HubSpot — deal card
      return (
        <div className="motif motif-crm" aria-hidden>
          <div className="stage dim">Deal created</div>
          <div className="stage hot" style={{ borderColor: s.brand }}>Proposal <em style={{ color: s.brand }}>auto-generated · their brand</em></div>
          <div className="stage dim">Viewed → owner notified</div>
        </div>
      );
  }
}

export default async function ToolLanding({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const t = TOOLS[tool];
  if (!t) notFound();

  return (
    <main className="fp" style={{ background: t.bg, color: t.ink, minHeight: "100vh" }}>
      <style>{`
        .fp { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; line-height: 1.65; }
        .fp .wrap { max-width: 880px; margin: 0 auto; padding: 0 1.5rem; }
        .fp nav { display: flex; justify-content: space-between; align-items: center; padding: 1.3rem 0; }
        .fp nav .home { font-weight: 800; font-size: 1.2rem; letter-spacing: -0.5px; color: ${t.ink}; text-decoration: none; }
        .fp nav .home b { color: ${t.brand}; }
        .fp nav a.gh { color: ${t.ink}; border: 1.5px solid ${t.dark ? "rgba(255,255,255,0.35)" : t.ink}; border-radius: 8px; padding: 0.4rem 0.9rem; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
        .fp .hero { padding: 4.5rem 0 2.5rem; }
        .fp .chip { display: inline-block; font-size: 0.8rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${t.brand}; border: 1.5px solid ${t.brand}; border-radius: 999px; padding: 0.3rem 0.9rem; margin-bottom: 1.4rem; }
        .fp h1 { font-size: clamp(2.1rem, 5vw, 3.3rem); line-height: 1.08; letter-spacing: -1.5px; max-width: 700px; white-space: pre-line; }
        .fp .sub { font-size: 1.15rem; opacity: 0.82; max-width: 620px; margin-top: 1.2rem; }
        .fp .benefits { padding: 2.5rem 0 0; }
        .fp .benefit { background: ${t.soft}; border-radius: ${t.radius}; padding: 1.4rem 1.5rem; transition: transform 0.25s ease; }
        .fp .benefit:hover { transform: translateY(-4px); }
        .fp .benefit h3 { font-size: 1.03rem; margin-bottom: 0.4rem; }
        .fp .benefit p { font-size: 0.93rem; opacity: 0.8; margin: 0; }
        .fp .snippet { margin-top: 2.8rem; }
        .fp .snippet h2 { font-size: 1.25rem; margin-bottom: 0.8rem; }
        .fp pre { font-family: ui-monospace, Menlo, monospace; font-size: 0.85rem; line-height: 1.7; background: ${t.dark ? "rgba(0,0,0,0.45)" : "#14161c"}; color: #d9dce3; border-radius: ${t.radius}; padding: 1.2rem 1.4rem; overflow-x: auto; border: 1px solid ${t.dark ? "rgba(255,255,255,0.12)" : "transparent"}; }
        .fp .ctas { display: flex; gap: 0.9rem; flex-wrap: wrap; padding: 2.6rem 0 3rem; }
        .fp .ctas a { text-decoration: none; font-weight: 700; border-radius: ${t.radius}; padding: 0.85rem 1.7rem; }
        .fp .ctas .p { background: ${t.brand}; color: ${t.dark ? "#0b0d10" : "#fff"}; }
        .fp .ctas .g { border: 1.5px solid ${t.dark ? "rgba(255,255,255,0.35)" : t.ink}; color: ${t.ink}; }
        .fp .legal { font-size: 0.78rem; opacity: 0.55; padding-bottom: 2.5rem; }

        /* layout variants — same content, three visibly different structures */
        .fp .benefits.lay-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
        .fp .benefits.lay-steps { display: flex; flex-direction: column; gap: 0; padding-top: 2rem; }
        .fp .benefits.lay-steps .benefit { display: flex; gap: 1.1rem; background: transparent; border-left: 2px solid ${t.brand}44; border-radius: 0; padding: 1.1rem 0 1.1rem 1.4rem; margin-left: 1rem; position: relative; }
        .fp .benefits.lay-steps .bstep { position: absolute; left: -1.05rem; top: 1.1rem; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .fp .benefits.lay-split { display: flex; flex-direction: column; gap: 1rem; padding-top: 2rem; }
        .fp .benefits.lay-split .benefit { display: grid; grid-template-columns: 1fr 2fr; gap: 1.2rem; align-items: start; }
        .fp .benefits.lay-split .benefit h3 { font-size: 1.15rem; }
        @media (max-width: 620px) { .fp .benefits.lay-split .benefit { grid-template-columns: 1fr; } }

        /* motifs */
        .fp .motif { margin-top: 2.6rem; }
        .fp .dim { opacity: 0.55; }
        .fp .motif-table .trow { display: flex; gap: 1.4rem; padding: 0.75rem 1rem; background: #fff; border: 1px solid #e2ddd0; border-radius: 6px; margin-bottom: 0.5rem; font-family: ui-monospace, Menlo, monospace; font-size: 0.85rem; animation: fp-slide 0.7s ease both; }
        .fp .motif-data { display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; }
        .fp .motif-data > div { background: ${t.soft}; border-radius: 12px; padding: 1rem 1.3rem; display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.9rem; }
        .fp .motif-data .dcard2 { border: 1.5px solid; }
        .fp .darrow { font-size: 1.6rem; font-weight: 800; }
        .fp .motif-term { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 1.1rem 1.3rem; font-family: ui-monospace, Menlo, monospace; font-size: 0.88rem; max-width: 560px; }
        .fp .motif-term p { margin: 0.3rem 0; }
        .fp .tbar { display: flex; gap: 6px; margin-bottom: 0.7rem; } .fp .tbar i { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.22); }
        .fp .cursor { display: inline-block; width: 8px; height: 15px; vertical-align: -2px; animation: fp-blink 1.1s steps(1) infinite; }
        .fp .motif-flow { display: flex; align-items: center; flex-wrap: wrap; gap: 0; }
        .fp .motif-flow .node { background: ${t.soft}; border: 1.5px solid rgba(255,255,255,0.18); border-radius: 999px; padding: 0.55rem 1.1rem; font-size: 0.88rem; font-weight: 600; }
        .fp .motif-flow .node.hot { border-width: 2px; }
        .fp .motif-flow .wire { width: 34px; height: 2px; }
        .fp .motif-inbox { max-width: 520px; display: flex; flex-direction: column; gap: 0.55rem; }
        .fp .motif-inbox .msg { border-radius: 14px; padding: 0.7rem 1.1rem; font-size: 0.92rem; }
        .fp .motif-inbox .them { background: #fff; border: 1px solid #dbe4f8; align-self: flex-start; }
        .fp .motif-inbox .you { color: #fff; align-self: flex-end; }
        .fp .motif-inbox .sig { background: transparent; font-size: 0.85rem; font-weight: 700; align-self: flex-end; padding: 0; }
        .fp .motif-crm { display: flex; flex-direction: column; gap: 0.5rem; max-width: 460px; }
        .fp .motif-crm .stage { background: #fff; border: 1.5px solid #f0ded6; border-radius: 10px; padding: 0.8rem 1.1rem; font-size: 0.92rem; font-weight: 600; }
        .fp .motif-crm .stage.hot { box-shadow: 0 10px 26px rgba(255,122,89,0.18); }
        .fp .motif-crm .stage em { display: block; font-style: normal; font-size: 0.8rem; font-weight: 500; }

        @keyframes fp-slide { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
        @keyframes fp-blink { 50% { opacity: 0; } }
        .js .fp-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .js .fp-reveal.in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) { .js .fp-reveal { opacity: 1; transform: none; transition: none; } .fp .cursor, .fp .motif-table .trow { animation: none; } }
      `}</style>

      <RevealFx />

      <div className="wrap">
        <nav>
          <a className="home" href="/">uniq<b>.</b></a>
          <a className="gh" href="https://github.com/getuniq/uniq">GitHub ★</a>
        </nav>

        <header className="hero">
          <span className="chip">Uniq × {t.name}</span>
          <h1>{t.headline}</h1>
          <p className="sub">{t.sub}</p>
          <Motif t={t} />
        </header>

        <section className={`benefits lay-${t.layout}`}>
          {t.benefits.map((b, i) => (
            <div className="benefit reveal fp-reveal" key={i}>
              {t.layout === "steps" && <span className="bstep" style={{ background: t.brand, color: t.dark ? "#0b0d10" : "#fff" }}>{i + 1}</span>}
              <div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="snippet reveal fp-reveal">
          <h2>{t.snippetTitle}</h2>
          <pre>{t.snippet}</pre>
        </section>

        <div className="ctas reveal fp-reveal">
          <a className="p" href="/">Try the live demo →</a>
          <a className="g" href="/integrations">All integrations</a>
        </div>

        <p className="legal">
          {t.name} is a trademark of its respective owner. Uniq is an independent open-source project that
          works alongside {t.name} — not affiliated with or endorsed by it.
        </p>
      </div>
    </main>
  );
}
