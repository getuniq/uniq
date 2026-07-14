"use client";

// /dashboard — the account view: every kit, its views, and the questions
// prospects asked. The platform's heartbeat for a seller.

import { useState } from "react";
import SiteNav from "@/components/SiteNav";

interface Q { question: string; email: string | null; created_at: string }
interface P { id: string; prospect_domain: string; views: number; created_at: string; url: string; questions: Q[] }
interface Me { email: string; domain: string; remaining: number; proposals: P[] }

export default function Dashboard() {
  const [apiKey, setApiKey] = useState("");
  const [me, setMe] = useState<Me | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${apiKey.trim()}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed");
      setMe(json);
    } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  }

  return (
    <div className="lp">
      <SiteNav />

      <header className="hero" style={{ paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "clamp(1.9rem, 4.5vw, 2.7rem)" }}>{me ? `${me.domain} — your kits` : "Your dashboard."}</h1>
        <p className="sub">{me ? `${me.remaining} proposals left on your plan.` : "Every kit, its views, and the questions prospects asked."}</p>
      </header>

      <div className="startflow" style={{ maxWidth: 780 }}>
        {!me ? (
          <div className="stepcard">
            <div className="stepnum">🔑</div>
            <h3>Your API key</h3>
            <div className="demo-input">
              <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="uq_…" disabled={busy} />
              <button onClick={load} disabled={busy || !apiKey.trim()}>{busy ? "Loading…" : "Open dashboard"}</button>
            </div>
            {error && <p className="demo-error">{error}</p>}
          </div>
        ) : me.proposals.length === 0 ? (
          <div className="stepcard"><h3>No kits yet</h3><p className="demo-note"><a href="/start">Generate your first →</a></p></div>
        ) : (
          me.proposals.map((p) => (
            <div className="stepcard" key={p.id}>
              <h3 style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <span>{p.prospect_domain}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)", fontWeight: 500 }}>
                  👀 {p.views} view{p.views === 1 ? "" : "s"} · {new Date(p.created_at).toLocaleDateString()}
                </span>
              </h3>
              <p style={{ margin: "0.3rem 0 0.6rem" }}>
                <a href={p.url} target="_blank" rel="noreferrer" style={{ color: "var(--brand)", fontWeight: 600 }}>{p.url.replace("https://", "")}</a>
              </p>
              {p.questions.length > 0 && (
                <div style={{ background: "var(--brand-soft)", borderRadius: 10, padding: "0.8rem 1rem" }}>
                  {p.questions.map((q, i) => (
                    <p key={i} style={{ fontSize: "0.92rem", padding: "0.25rem 0" }}>
                      ❓ “{q.question}” {q.email && <em style={{ color: "var(--ink-soft)" }}>— {q.email}</em>}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Uniq</span>
        <span><a href="/pricing">Pricing</a> · <a href="/integrations">Integrations</a></span>
      </footer>
    </div>
  );
}
