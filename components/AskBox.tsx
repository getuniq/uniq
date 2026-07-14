"use client";

// The two-way box on hosted proposal pages: a prospect can ask instead of
// going silent. Styled by the page's brand tokens via props.

import { useState } from "react";

export default function AskBox({ proposalId, primary, sellerName }: {
  proposalId: string; primary: string; sellerName: string;
}) {
  const [q, setQ] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (q.trim().length < 3) return;
    setState("busy"); setError(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proposalId, question: q.trim(), email: email.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed");
      setState("sent");
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e)); setState("idle");
    }
  }

  if (state === "sent") {
    return <p className="askbox-done">✓ Sent — {sellerName} will get back to you shortly.</p>;
  }
  return (
    <div className="askbox">
      <p className="askbox-title">Have a question before you decide?</p>
      <textarea
        value={q} onChange={(e) => setQ(e.target.value)} rows={2}
        placeholder={`Ask ${sellerName} anything about this proposal…`}
        disabled={state === "busy"}
      />
      <div className="askbox-row">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com (for the answer)" disabled={state === "busy"} />
        <button onClick={submit} disabled={state === "busy" || q.trim().length < 3} style={{ background: primary }}>
          {state === "busy" ? "Sending…" : "Ask"}
        </button>
      </div>
      {error && <p className="askbox-err">{error}</p>}
    </div>
  );
}
