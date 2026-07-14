"use client";

// The 2-second-understanding device: paste any company URL, watch Uniq pull
// their brand live (colors, font, logo) — then generate the full closing kit.
// Nobody in the category shows the output live; this is the wedge, demonstrated.

import { useState } from "react";

interface Brand {
  domain: string; title: string; description: string;
  colors: string[]; fonts: string[]; logo: string | null;
}

interface Kit {
  id: string; proposalUrl: string; narrative: string;
  email: { subject: string; body: string };
  prospect: { company: string; domain: string };
}

export default function BrandDemo() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "brand" | "branded" | "kit" | "done">("idle");
  const [brand, setBrand] = useState<Brand | null>(null);
  const [kit, setKit] = useState<Kit | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function extractBrand() {
    if (!url.trim()) return;
    setError(null); setKit(null); setBrand(null); setPhase("brand");
    try {
      const res = await fetch(`/api/brand?url=${encodeURIComponent(url.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "extraction failed");
      setBrand(json); setPhase("branded");
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e)); setPhase("idle");
    }
  }

  async function generateKit() {
    if (!brand) return;
    setError(null); setPhase("kit");
    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerUrl: "uniq.team", prospectUrl: brand.domain }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "generation failed");
      setKit(json); setPhase("done");
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e)); setPhase("branded");
    }
  }

  return (
    <div className="demo">
      <div className="demo-input">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && extractBrand()}
          placeholder="Paste any company's URL — try your prospect's"
          aria-label="Prospect URL"
          disabled={phase === "brand" || phase === "kit"}
        />
        <button onClick={extractBrand} disabled={phase === "brand" || phase === "kit" || !url.trim()}>
          {phase === "brand" ? "Reading their site…" : "Extract their brand"}
        </button>
      </div>
      {error && <p className="demo-error">{error}</p>}

      {brand && (
        <div className="demo-brand" style={{ borderColor: brand.colors[0] ?? "#7C3AED" }}>
          <div className="demo-brand-head">
            {brand.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo} alt="" width={34} height={34} style={{ borderRadius: 8, objectFit: "contain", background: "#fff" }} />
            )}
            <div>
              <strong>{brand.title || brand.domain}</strong>
              <span>{brand.domain}</span>
            </div>
          </div>
          <div className="demo-tokens">
            <div className="demo-swatches">
              {brand.colors.map((c) => (
                <span key={c} className="demo-swatch" style={{ background: c }} title={c} />
              ))}
            </div>
            {brand.fonts[0] && <code>{brand.fonts[0]}</code>}
          </div>
          <p className="demo-note">
            ↑ Extracted in seconds — every artifact Uniq generates for {brand.title || brand.domain} ships in <em>these</em> colors, not yours.
          </p>
          {phase !== "done" && (
            <button className="demo-generate" onClick={generateKit} disabled={phase === "kit"}>
              {phase === "kit" ? "Generating the kit (~60s — three artifacts, one narrative)…" : "Generate the full closing kit →"}
            </button>
          )}
        </div>
      )}

      {kit && (
        <div className="demo-kit">
          <div className="demo-kit-col">
            <h4>✉ The email</h4>
            <p className="demo-subject">{kit.email.subject}</p>
            <p className="demo-body">{kit.email.body}</p>
          </div>
          <div className="demo-kit-col">
            <h4>◈ The hosted proposal</h4>
            <p>{kit.narrative}</p>
            <a href={kit.proposalUrl} target="_blank" rel="noreferrer" className="demo-open">
              Open {kit.prospect.company}&apos;s branded page →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
