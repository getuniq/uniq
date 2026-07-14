"use client";

// /refine — the pitch interviewer. 4-6 sharp questions → your cached profile
// gets the founder-brain context no crawler can extract. Platform-only.

import { useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";

interface Msg { role: "user" | "assistant"; content: string }

export default function Refine() {
  const [apiKey, setApiKey] = useState("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function turn(next: Msg[]) {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed");
      if (json.action === "finalize") {
        setMessages([...next, { role: "assistant", content: json.summary }]);
        setDone(json.summary);
      } else {
        setMessages([...next, { role: "assistant", content: json.question }]);
      }
    } catch (e) { setError(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(false); }
  }

  return (
    <div className="lp">
      <SiteNav />

      <header className="hero" style={{ paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "clamp(1.9rem, 4.5vw, 2.7rem)" }}>Sharpen your pitch.</h1>
        <p className="sub">Your profile was extracted from your website. A 3-minute interview adds what no crawler can see — the ICP that buys fastest, your real differentiator, the objection you actually hear. Every future kit gets sharper.</p>
      </header>

      <div className="startflow">
        {!started ? (
          <div className="stepcard">
            <div className="stepnum">🔑</div>
            <h3>Your API key</h3>
            <div className="demo-input">
              <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="uq_…" />
              <button disabled={!apiKey.trim() || busy} onClick={() => { setStarted(true); void turn([]); }}>
                {busy ? "Starting…" : "Start the interview"}
              </button>
            </div>
            <p className="demo-note">From your signup at <a href="/start">/start</a>. The refined profile is saved to your account.</p>
          </div>
        ) : (
          <div className="stepcard">
            <div className="stepnum">🎙</div>
            <h3>Pitch interview</h3>
            <div className="chat">
              {messages.map((m, i) => (
                <p key={i} className={`bubble ${m.role}`}>{m.content}</p>
              ))}
              {busy && <p className="bubble assistant thinking">…</p>}
              <div ref={endRef} />
            </div>
            {error && <p className="demo-error">{error}</p>}
            {done ? (
              <p className="demo-note" style={{ marginTop: "0.8rem" }}>
                ✓ Saved. Every proposal you generate from now on uses the sharpened profile.{" "}
                <a href="/start">Generate one now →</a>
              </p>
            ) : (
              <div className="demo-input" style={{ marginTop: "0.8rem" }}>
                <input value={input} onChange={(e) => setInput(e.target.value)} disabled={busy}
                  placeholder="Your answer… (or say 'wrap it up')"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && input.trim() && !busy) {
                      const next: Msg[] = [...messages, { role: "user" as const, content: input.trim() }];
                      setMessages(next); setInput(""); void turn(next);
                    }
                  }} />
                <button disabled={busy || !input.trim()} onClick={() => {
                  const next: Msg[] = [...messages, { role: "user" as const, content: input.trim() }];
                  setMessages(next); setInput(""); void turn(next);
                }}>Send</button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Uniq</span>
        <span><a href="/pricing">Pricing</a> · <a href="/integrations">Integrations</a></span>
      </footer>
    </div>
  );
}
