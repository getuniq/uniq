"use client";

// /start — the ideal flow. Three steps, each with its own aha:
//  1. Your URL → watch Uniq build your seller profile live (it already knows your pitch)
//  2. Email → account + API key, 5 free proposals
//  3. First prospect URL → your first branded kit, right here
// No password, no verification wall — the key is the credential (v0).

import { useState } from "react";
import StagedLoader from "@/components/StagedLoader";

interface Profile { domain: string; logo: string | null; colors: string[]; profile: { company: string; one_liner: string; value_props: string[]; proof_points: string[]; tone: string } }
interface Account { apiKey: string; email: string; domain: string; freeProposals: number }
interface Kit { id: string; proposalUrl: string; email: { subject: string; body: string }; prospect: { company: string } }

export default function Start() {
  const [sellerUrl, setSellerUrl] = useState("");
  const [email, setEmail] = useState("");
  const [prospectUrl, setProspectUrl] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [kit, setKit] = useState<Kit | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function post(url: string, body: object, headers: Record<string, string> = {}) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "request failed");
    return json;
  }

  async function buildProfile() {
    if (!sellerUrl.trim()) return;
    setError(null); setBusy("profile");
    try { setProfile(await post("/api/profile", { sellerUrl: sellerUrl.trim() })); }
    catch (e) { setError(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(null); }
  }

  async function createAccount() {
    if (!email.trim() || !profile) return;
    setError(null); setBusy("signup");
    try {
      const r = await post("/api/signup", { email: email.trim(), sellerUrl: profile.domain });
      if (r.needsVerification) setPendingEmail(r.email);
      else setAccount(r);
    }
    catch (e) { setError(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(null); }
  }

  async function verifyCode() {
    if (!pendingEmail || !code.trim()) return;
    setError(null); setBusy("verify");
    try { setAccount(await post("/api/verify", { email: pendingEmail, code: code.trim() })); setPendingEmail(null); }
    catch (e) { setError(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(null); }
  }

  async function firstKit() {
    if (!prospectUrl.trim() || !account || !profile) return;
    setError(null); setBusy("kit");
    try {
      setKit(await post("/api/proposal", { sellerUrl: profile.domain, prospectUrl: prospectUrl.trim() }, { Authorization: `Bearer ${account.apiKey}` }));
    } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(null); }
  }

  return (
    <div className="lp start">
      <nav className="nav">
        <a className="logo" href="/" aria-label="Uniq">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="uniq." height={34} />
        </a>
        <div className="links"><a className="gh" href="https://github.com/getuniq/uniq">GitHub ★</a></div>
      </nav>

      <header className="hero" style={{ paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)" }}>{account ? "You're in." : "Start with your website."}</h1>
        <p className="sub">{account
          ? `${account.freeProposals} free proposals on us — here's your key and your first kit.`
          : "Uniq reads your site once and knows your pitch forever. Then every prospect gets a proposal in their brand."}</p>
      </header>

      <div className="startflow">
        {/* Step 1 — seller profile */}
        {!account && (
          <div className="stepcard">
            <div className="stepnum">1</div>
            <h3>Your website</h3>
            <div className="demo-input">
              <input value={sellerUrl} onChange={(e) => setSellerUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buildProfile()}
                placeholder="yoursaas.com" disabled={busy === "profile" || !!profile} />
              {!profile && <button onClick={buildProfile} disabled={busy === "profile" || !sellerUrl.trim()}>
                {busy === "profile" ? "Working…" : "Build my profile"}
              </button>}
            </div>
            {busy === "profile" && <StagedLoader stages={["Crawling your site…", "Reading your pricing & proof points…", "Extracting your brand & voice…", "Writing your seller profile…"]} />}
            {profile && (
              <div className="profilecard" style={{ borderColor: profile.colors[0] ?? "#7C3AED" }}>
                <div className="demo-brand-head">
                  {profile.logo && /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={profile.logo} alt="" width={34} height={34} style={{ borderRadius: 8, objectFit: "contain", background: "#fff" }} />}
                  <div><strong>{profile.profile.company}</strong><span>{profile.profile.one_liner}</span></div>
                </div>
                <ul>{profile.profile.value_props.map((v, i) => <li key={i}>{v}</li>)}</ul>
                <p className="demo-note">✓ Profile saved — every proposal you generate starts from this. Cached, editable, yours.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — account */}
        {profile && !account && !pendingEmail && (
          <div className="stepcard">
            <div className="stepnum">2</div>
            <h3>Where do we send the goods?</h3>
            <div className="demo-input">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createAccount()}
                placeholder="you@yoursaas.com" disabled={busy === "signup"} />
              <button onClick={createAccount} disabled={busy === "signup" || !email.trim()}>
                {busy === "signup" ? "Creating…" : "Get my API key — free"}
              </button>
            </div>
            <p className="demo-note">5 free proposals · MCP + API + CLI access · no card, no spam.</p>
          </div>
        )}

        {/* Step 2.5 — email verification */}
        {pendingEmail && !account && (
          <div className="stepcard">
            <div className="stepnum">✉</div>
            <h3>Enter the 6-digit code we emailed to {pendingEmail}</h3>
            <div className="demo-input">
              <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                placeholder="123456" disabled={busy === "verify"} />
              <button onClick={verifyCode} disabled={busy === "verify" || code.trim().length < 6}>
                {busy === "verify" ? "Checking…" : "Verify"}
              </button>
            </div>
            <p className="demo-note">Didn&apos;t get it? Check spam, or click &quot;Get my API key&quot; again to resend.</p>
          </div>
        )}

        {/* Step 3 — key + first kit */}
        {account && (
          <>
            <div className="stepcard">
              <div className="stepnum">✓</div>
              <h3>Your API key</h3>
              <div className="keyrow">
                <code>{account.apiKey}</code>
                <button onClick={() => { navigator.clipboard.writeText(account.apiKey); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <pre className="snippetpre">{`# any MCP client (Claude Code, Cursor, ...)
claude mcp add --transport http uniq https://uniq.team/api/mcp \\
  --header "Authorization: Bearer ${account.apiKey.slice(0, 8)}…"`}</pre>
            </div>
            <div className="stepcard">
              <div className="stepnum">3</div>
              <h3>Your first kit — pick a prospect</h3>
              <div className="demo-input">
                <input value={prospectUrl} onChange={(e) => setProspectUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && firstKit()}
                  placeholder="prospect.com" disabled={busy === "kit"} />
                <button onClick={firstKit} disabled={busy === "kit" || !prospectUrl.trim()}>
                  {busy === "kit" ? "Working…" : "Generate"}
                </button>
              </div>
              {busy === "kit" && <StagedLoader stages={["Crawling the prospect…", "Extracting their brand — colors, type, logo…", "Finding their pains & buying triggers…", "Writing one narrative…", "Composing email + pitch + hosted page…", "Polishing the details…"]} cycleMs={11000} />}
              {kit && (
                <div className="demo-kit" style={{ marginTop: "1rem" }}>
                  <div className="demo-kit-col">
                    <h4>✉ {kit.email.subject}</h4>
                    <p className="demo-body">{kit.email.body.slice(0, 260)}…</p>
                  </div>
                  <div className="demo-kit-col">
                    <h4>◈ The close</h4>
                    <a href={kit.proposalUrl} target="_blank" rel="noreferrer" className="demo-open">Open {kit.prospect.company}&apos;s branded page →</a>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {error && <p className="demo-error">{error}</p>}
      </div>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Uniq — proudly open source</span>
        <span><a href="/pricing">Pricing</a> · <a href="/integrations">Integrations</a></span>
      </footer>
    </div>
  );
}
