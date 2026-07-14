// uniq.team — v2. Lead ICP: GTM builders / agent-workflow operators.
// Design doctrine (from competitive teardown):
//  · Show the output LIVE (nobody in the category does) — BrandDemo in the hero.
//  · Prospect-brand extraction is the hero mechanic, agent-native above the fold.
//  · Stack-position section (Swan pattern): we own the proposal step, we don't replace the stack.
//  · Transparent pricing link, real example proposal as proof.

import BrandDemo from "@/components/BrandDemo";
import RevealFx from "@/components/RevealFx";

const GITHUB = "https://github.com/getuniq/uniq";
const EXAMPLE = "/p/on6e1uf29"; // real generated proposal (Vest → Postiz)

const STACK_TOOLS: Array<{ name: string; href?: string }> = [
  { name: "Clay", href: "/for/clay" },
  { name: "Apollo", href: "/for/apollo" },
  { name: "Oxygen", href: "/for/oxygen" },
  { name: "n8n", href: "/for/n8n" },
  { name: "Instantly", href: "/for/instantly" },
  { name: "HubSpot", href: "/for/hubspot" },
  { name: "Claude Code" },
  { name: "Cursor" },
  { name: "Smartlead" },
  { name: "Make" },
  { name: "Zapier" },
  { name: "Attio" },
];

export default function Landing() {
  return (
    <div className="lp">
      <RevealFx />
      <nav className="nav">
        <a className="logo" href="/" aria-label="Uniq">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="uniq." height={34} />
        </a>
        <div className="links">
          <a href="#how">How it works</a>
          <a href="#stack">In your stack</a>
          <a href="/pricing">Pricing</a>
          <a href="/integrations">Integrations</a>
          <a className="gh" href={GITHUB}>GitHub ★</a>
        </div>
      </nav>

      <header className="hero">
        <span className="badge">Open source · AGPL · works with Claude, Cursor, Clay, n8n</span>
        <h1>Every prospect gets a proposal<br />in <em>their own brand</em>.</h1>
        <p className="sub">
          Two URLs in, a closing kit out: a personalized email, a pitch page, and a hosted
          proposal wearing the prospect&apos;s colors, type, and logo. Built for agents — MCP,
          API, CLI — operable by humans.
        </p>

        <BrandDemo />

        <p className="hero-proof">
          Skeptical? <a href={EXAMPLE}>Here&apos;s a real kit Uniq generated for Postiz</a> — their brand, not ours.
        </p>

        <div className="stackwall" aria-label="Works with your GTM stack">
          <p className="stackwall-label">The proposal step for your GTM stack</p>
          <div className="marquee">
            <div className="marquee-track">
              {[...STACK_TOOLS, ...STACK_TOOLS].map((t, i) =>
                t.href
                  ? <a className="toolchip linked" key={i} href={t.href}>{t.name} →</a>
                  : <span className="toolchip" key={i}>{t.name}</span>,
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="section reveal lp-reveal" id="how">
        <h2>One narrative, three artifacts</h2>
        <p className="lead">Your agents research and sequence. Uniq turns that research into something a buyer says yes to.</p>
        <div className="grid3">
          <div className="card">
            <div className="step">01 · THE HOOK</div>
            <h3>Personalized email</h3>
            <p>90–140 words in your voice, anchored on something true about the prospect. Teases
               the proposal; the link goes out on reply — deliverability is physics, not vibes.</p>
          </div>
          <div className="card">
            <div className="step">02 · THE PITCH</div>
            <h3>HTML one-pager</h3>
            <p>A complete, self-contained pitch page in the <em>prospect&apos;s</em> extracted brand.
               Attach it, embed it, or tell your agent: <code>edit_artifact — &quot;lead with ROI&quot;</code>.</p>
          </div>
          <div className="card">
            <div className="step">03 · THE CLOSE</div>
            <h3>Hosted proposal page</h3>
            <p>Trackable page at <code>uniq.team/p/…</code> in their branding. First open fires a
               <code>proposal.viewed</code> webhook — your agent knows the moment to follow up.</p>
          </div>
        </div>
      </section>

      <section className="section reveal lp-reveal" id="stack">
        <h2>It sits in your stack. It owns the proposal step.</h2>
        <p className="lead">Uniq doesn&apos;t replace Clay, n8n, or your sequencer — it&apos;s the artifact layer between research and delivery.</p>
        <div className="stackflow">
          <div className="stackstep"><span>RESEARCH</span>Clay · Apollo · your agent</div>
          <div className="stackarrow">→</div>
          <div className="stackstep own"><span>THE ARTIFACT</span>Uniq: email + pitch + branded page</div>
          <div className="stackarrow">→</div>
          <div className="stackstep"><span>DELIVERY</span>Instantly · Smartlead · CRM</div>
          <div className="stackarrow">→</div>
          <div className="stackstep"><span>SIGNAL</span>proposal.viewed → follow up</div>
        </div>
        <div className="split" style={{ marginTop: "1.2rem" }}>
          <div className="card">
            <h3>MCP — one link, every client</h3>
            <ul>
              <li><code>create_proposal</code> — two URLs → the full kit</li>
              <li><code>edit_artifact</code> — &quot;shorten it&quot;, &quot;lead with ROI&quot;</li>
              <li><code>get_engagement</code> — views back to the agent</li>
            </ul>
          </div>
          <div className="card">
            <h3>API &amp; CLI — pipeline-native</h3>
            <ul>
              <li>One endpoint in a Clay HTTP column</li>
              <li>n8n HTTP-Request templates, copy-paste</li>
              <li><code>npx @getuniq/cli</code> — JSON out, pipe anywhere</li>
            </ul>
          </div>
        </div>
        <p className="lead" style={{ marginTop: "1rem" }}>
          Recipes for Clay, n8n, Claude Code, and Cursor → <a href="/integrations">integrations</a>
        </p>
      </section>

      <section id="oss" className="oss reveal lp-reveal">
        <div>
          <h2>The engine is yours. Forever.</h2>
          <p>
            Crawl → brand extraction → generation, AGPL-licensed, self-hostable with your own
            Anthropic key. The cloud adds hosted pages on your domain, engagement analytics,
            teams, and the managed MCP endpoint. <a href="/pricing" style={{ color: "#A78BFA" }}>Honest per-proposal pricing</a> — no opaque credits.
          </p>
          <a className="btn" href={GITHUB}>github.com/getuniq/uniq</a>
        </div>
        <pre>{`$ git clone https://github.com/getuniq/uniq
$ cd uniq && npm install
$ ANTHROPIC_API_KEY=sk-... npm run dev
`}<span className="g"># your proposal engine, on your infra</span></pre>
      </section>

      <div className="watermark" aria-hidden>uniq.</div>
      <footer className="footer">
        <span>© {new Date().getFullYear()} Uniq — proudly open source</span>
        <span>
          <a href={GITHUB}>GitHub</a> · <a href="/llms.txt">llms.txt</a> · <a href="/integrations">Integrations</a> · <a href="/pricing">Pricing</a> · <a href="/api/mcp">MCP</a>
        </span>
      </footer>
    </div>
  );
}
