// Pricing — Qwilr pattern: clean cards + a legible usage meter (cost per
// proposal visibly drops by tier). Anti-pattern we refuse: opaque credits.
// Self-host stays OFF the grid (Postiz pattern) — it's the free tier, one line.
// Checkout: Stripe payment links via env; until set, CTAs capture early access.

import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Pricing — Uniq",
  description: "Honest per-proposal pricing. Self-hosting is free forever (AGPL).",
};

const EARLY = "mailto:gal@uniq.team?subject=Uniq%20early%20access&body=Tier%3A%20";

function checkout(tier: "starter" | "team" | "scale"): { href: string; label: string } {
  const link = {
    starter: process.env.NEXT_PUBLIC_STRIPE_LINK_STARTER,
    team:    process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM,
    scale:   process.env.NEXT_PUBLIC_STRIPE_LINK_SCALE,
  }[tier];
  return link
    ? { href: link, label: "Start now →" }
    : { href: `${EARLY}${tier}`, label: "Get early access →" };
}

export default function Pricing() {
  const starter = checkout("starter"), team = checkout("team"), scale = checkout("scale");
  return (
    <div className="lp">
      <SiteNav />

      <header className="hero" style={{ paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>Priced per proposal.<br /><em>You can do the math.</em></h1>
        <p className="sub">No credits, no calculators. A proposal is a proposal — the unit cost drops as you scale.</p>
      </header>

      <section style={{ paddingBottom: "1rem" }}>
        <div className="tiers">
          <div className="tier">
            <h3>Starter</h3>
            <div className="price">$29<small>/mo</small></div>
            <div className="unit">50 proposals · $0.58 each</div>
            <ul>
              <li>1 seller profile</li>
              <li>Hosted pages on uniq.team</li>
              <li>MCP + API + CLI access</li>
              <li>View tracking + webhooks</li>
            </ul>
            <a className="cta ghosted" href={starter.href}>{starter.label}</a>
          </div>

          <div className="tier popular">
            <span className="pop-badge">For GTM builders</span>
            <h3>Team</h3>
            <div className="price">$49<small>/mo</small></div>
            <div className="unit">150 proposals · $0.33 each</div>
            <ul>
              <li>Unlimited users</li>
              <li>Custom domain for proposal pages</li>
              <li>Clay / n8n / CRM integrations</li>
              <li>Engagement analytics</li>
            </ul>
            <a className="cta" href={team.href}>{team.label}</a>
          </div>

          <div className="tier">
            <h3>Scale</h3>
            <div className="price">$99<small>/mo</small></div>
            <div className="unit">500 proposals · $0.20 each</div>
            <ul>
              <li>Multi-brand — run client campaigns</li>
              <li>White-label pages</li>
              <li>High API rate limits</li>
              <li>Priority support</li>
            </ul>
            <a className="cta ghosted" href={scale.href}>{scale.label}</a>
          </div>
        </div>

        <div className="cmp">
          <h2 style={{ fontSize: "1.6rem", margin: "3rem 0 1rem" }}>Compare everything</h2>
          <div className="cmp-table">
            <div className="cmp-row cmp-head"><span>Feature</span><span>Self-host</span><span>Starter</span><span>Team</span><span>Scale</span></div>
            {[
              ["Proposals / month", "Unlimited*", "50", "150", "500"],
              ["Generation engine (crawl → brand → 3 artifacts)", "✓", "✓", "✓", "✓"],
              ["Prompt-based editing (edit_artifact)", "✓", "✓", "✓", "✓"],
              ["MCP + REST + CLI", "✓ (yours)", "✓ managed", "✓ managed", "✓ managed"],
              ["Hosted proposal pages", "your infra", "uniq.team", "your domain", "white-label"],
              ["proposal.viewed / .question webhooks", "✓", "✓", "✓", "✓"],
              ["Two-way pages (prospect questions)", "—", "✓", "✓", "✓"],
              ["Pitch-refinement interviewer", "—", "✓", "✓", "✓"],
              ["Dashboard (views + questions)", "—", "✓", "✓", "✓"],
              ["Engagement analytics", "—", "basic", "full", "full"],
              ["Users", "—", "1", "Unlimited", "Unlimited"],
              ["Multi-brand (client campaigns)", "—", "—", "—", "✓"],
              ["API rate limits", "yours", "60/hr", "60/hr", "high"],
              ["Support", "community", "email", "priority", "priority"],
            ].map((r, i) => (
              <div className="cmp-row" key={i}>{r.map((c, j) => <span key={j}>{c}</span>)}</div>
            ))}
          </div>
          <p className="demo-note" style={{ marginTop: "0.5rem" }}>* Unlimited on your own Anthropic key — you pay the model, not us.</p>
        </div>

        <div className="faq">
          <h2 style={{ fontSize: "1.6rem", margin: "3rem 0 1rem" }}>Questions, answered</h2>
          {[
            ["What exactly is \u201cone proposal\u201d?", "One create_proposal call: the personalized email + the pitch HTML + the hosted branded page, all from one narrative. Edits to an existing proposal are free."],
            ["Is the hosted version different from self-host?", "The generation engine is identical and AGPL. The cloud adds hosted pages, two-way questions, the interviewer, analytics, a managed MCP endpoint, and the dashboard."],
            ["Do I need my own Anthropic key?", "Only if you self-host. Cloud plans include generation — the price you see is the price you pay."],
            ["What happens when I hit my monthly cap?", "Generation pauses and we tell you (HTTP 402, politely). Upgrade a tier or wait for the reset — existing pages keep working and keep tracking."],
            ["Can prospects tell it was AI-generated?", "Pages carry a slim Uniq bar on free/Starter tiers; Scale white-labels it away. The content itself is grounded in real research on the prospect — that's why it doesn't read like AI."],
            ["Do unused proposals roll over?", "No — caps reset monthly. That's what keeps the per-proposal math honest."],
            ["How do agents authenticate?", "The same API key, passed as a bearer header on MCP or REST. One key works across Claude Code, Cursor, Clay, n8n, and the CLI."],
            ["Can I cancel any time?", "Yes. And because the engine is open source, you can always take your workflow and self-host — your seller profile is exportable."],
          ].map(([q, a], i) => (
            <details key={i} className="faq-item" open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>

        <p className="pricing-note">
          <strong>Self-hosting is free, forever.</strong> The full engine is AGPL — clone{" "}
          <a href="https://github.com/getuniq/uniq">github.com/getuniq/uniq</a>, bring your own
          Anthropic key, and there is no functional difference in the generation engine. The cloud
          is for hosted pages on your domain, analytics, teams, and the managed MCP endpoint.
        </p>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Uniq — proudly open source</span>
        <span><a href="https://github.com/getuniq/uniq">GitHub</a> · <a href="/llms.txt">llms.txt</a></span>
      </footer>
    </div>
  );
}
