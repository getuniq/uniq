// uniq.team landing — written for the lead ICP: GTM builders / agent-workflow
// operators. Agent-native first, human chat second. The repo is the CTA.

const GITHUB = "https://github.com/getuniq/uniq";

export default function Landing() {
  return (
    <div className="lp">
      <nav className="nav">
        <a className="logo" href="/">uniq<span>.</span></a>
        <div className="links">
          <a href="#how">How it works</a>
          <a href="#agents">For agents</a>
          <a href="#oss">Open source</a>
          <a className="gh" href={GITHUB}>GitHub ★</a>
        </div>
      </nav>

      <header className="hero">
        <span className="badge">Open source · AGPL · agent-native</span>
        <h1>Two URLs in.<br />A <em>closing kit</em> out.</h1>
        <p className="sub">
          Give Uniq your website and your prospect&apos;s website. It returns a personalized
          email, an HTML pitch page, and a hosted proposal in the prospect&apos;s own branding —
          the artifact layer your outbound agents are missing.
        </p>
        <div className="ctas">
          <a className="btn primary" href={GITHUB}>Star on GitHub</a>
          <a className="btn ghost" href="/llms.txt">llms.txt →</a>
        </div>

        <div className="term">
          <div><span className="c"># any MCP client — Claude, Cursor, ChatGPT, your agent stack</span></div>
          <div><span className="g">{'>'}</span> connect <span className="v">mcp.uniq.team</span></div>
          <div><span className="g">{'>'}</span> create_proposal seller_url=<span className="v">yoursaas.com</span> prospect_url=<span className="v">acme.com</span></div>
          <div className="c"># → email + pitch.html + https://uniq.team/p/x7k2m9q4p — in Acme&apos;s brand colors</div>
        </div>
      </header>

      <section className="section" id="how">
        <h2>One narrative, three artifacts</h2>
        <p className="lead">
          Your agents can research and sequence. Uniq turns that research into something a
          buyer can say yes to.
        </p>
        <div className="grid3">
          <div className="card">
            <div className="step">01 · THE HOOK</div>
            <h3>Personalized email</h3>
            <p>90–140 words in your voice, anchored on something true about the prospect.
               Teases the proposal — the link goes out on reply, not in the cold email
               (deliverability is physics, not vibes).</p>
          </div>
          <div className="card">
            <div className="step">02 · THE PITCH</div>
            <h3>HTML one-pager</h3>
            <p>A complete, self-contained pitch page — styled with the <em>prospect&apos;s</em> brand
               tokens Uniq extracts from their site: colors, typography, logo. Attach it, embed
               it, or let your agent iterate on it.</p>
          </div>
          <div className="card">
            <div className="step">03 · THE CLOSE</div>
            <h3>Hosted proposal page</h3>
            <p>A trackable proposal at <code>uniq.team/p/…</code> in the prospect&apos;s branding —
               problem, solution, deliverables, pricing, CTA. Views flow back to your
               agent via <code>get_engagement</code>.</p>
          </div>
        </div>
      </section>

      <section className="section" id="agents">
        <h2>Built for the outbound agent stack</h2>
        <p className="lead">
          Clay tables, n8n flows, Claude-based SDR stacks — Uniq is the artifact step.
          Every surface is agent-first; the human chat UI operates the same engine.
        </p>
        <div className="split">
          <div className="card">
            <h3>MCP — one link, every client</h3>
            <ul>
              <li><code>create_proposal</code> — two URLs → the full kit</li>
              <li><code>get_proposal</code> — fetch artifacts, iterate</li>
              <li><code>get_engagement</code> — views back to the agent</li>
            </ul>
          </div>
          <div className="card">
            <h3>API &amp; CLI — pipeline-native</h3>
            <ul>
              <li>REST with generous, published rate limits</li>
              <li><code>npx @getuniq/cli</code> — JSON out, pipe anywhere</li>
              <li><code>llms.txt</code> + OpenAPI, written agent-first</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="oss" className="oss">
        <div>
          <h2>The engine is yours. Forever.</h2>
          <p>
            Full crawl → brand-extraction → generation engine, AGPL-licensed, self-hostable
            with your own Anthropic key. The hosted cloud adds proposal pages on your domain,
            engagement analytics, teams, and a managed MCP endpoint.
          </p>
          <a className="btn" href={GITHUB}>github.com/getuniq/uniq</a>
        </div>
        <pre>{`$ git clone https://github.com/getuniq/uniq
$ cd uniq && npm install
$ ANTHROPIC_API_KEY=sk-... npm run dev
`}<span className="g"># your proposal engine, on your infra</span></pre>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Uniq — uniq.team</span>
        <span>
          <a href={GITHUB}>GitHub</a> · <a href="/llms.txt">llms.txt</a> · <a href="/api/mcp">MCP endpoint</a>
        </span>
      </footer>
    </div>
  );
}
