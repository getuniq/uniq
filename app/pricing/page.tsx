// Pricing — Qwilr pattern: clean cards + a legible usage meter (cost per
// proposal visibly drops by tier). Anti-pattern we refuse: opaque credits.
// Self-host stays OFF the grid (Postiz pattern) — it's the free tier, one line.
// Checkout: Stripe payment links via env; until set, CTAs capture early access.

import type { Metadata } from "next";

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
      <nav className="nav">
        <a className="logo" href="/" aria-label="Uniq">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="uniq." height={34} />
        </a>
        <div className="links">
          <a href="/#how">How it works</a>
          <a href="/integrations">Integrations</a>
          <a className="gh" href="https://github.com/getuniq/uniq">GitHub ★</a>
        </div>
      </nav>

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
