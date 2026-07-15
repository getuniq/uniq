// The product experience — the seller's product simulated as if the buyer
// already runs it. Five visual treatments (chat / dashboard / workflow /
// mockup / report), all framed in app chrome and wearing the buyer's brand.
// Server component: pure markup; motion comes from the page's reveal system.

import type { Demo } from "@/lib/generate";

export default function ProductDemo({ demo, primary, accent, sellerName, buyerName, logo }: {
  demo: Demo; primary: string; accent: string; sellerName: string; buyerName: string; logo: string | null;
}) {
  return (
    <div className="pdemo">
      <div className="pd-chrome">
        <i /><i /><i />
        <span className="pd-url">{demo.kind === "mockup" ? `${buyerName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com — powered by ${sellerName}` : `${sellerName.toLowerCase().replace(/[^a-z0-9]/g, "")} · ${buyerName}'s workspace`}</span>
        <span className="pd-sim">simulated preview</span>
      </div>

      <div className="pd-body">
        <p className="pd-title">
          {logo && /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logo} alt="" width={22} height={22} style={{ borderRadius: 5, background: "#fff", objectFit: "contain", verticalAlign: "-5px", marginRight: 8 }} />}
          {demo.title}
        </p>

        {demo.kind === "chat" && (
          <div className="pd-chat">
            {demo.messages.map((m, i) => (
              <p key={i} className={`pd-msg ${m.from}`} style={m.from === "product" ? { background: primary, color: "#fff" } : undefined}>
                {m.text}
              </p>
            ))}
            <p className="pd-typing"><i style={{ background: accent }} /><i style={{ background: accent }} /><i style={{ background: accent }} /></p>
          </div>
        )}

        {demo.kind === "dashboard" && (
          <>
            <div className="pd-metrics">
              {demo.metrics.map((m, i) => (
                <div key={i} className="pd-metric">
                  <b style={{ color: primary }}>{m.value}</b>
                  <span>{m.label}</span>
                  {m.delta && <em style={{ color: accent }}>{m.delta}</em>}
                </div>
              ))}
            </div>
            <div className="pd-feed">
              {demo.feed.map((f, i) => (
                <div key={i} className="pd-row">
                  <span className="pd-row-t">{f.title}</span>
                  <span className="pd-row-m">{f.meta}</span>
                  <span className="pd-row-s" style={{ color: accent }}>{f.status}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {demo.kind === "workflow" && (
          <div className="pd-flow">
            {demo.steps.map((st, i) => (
              <div key={i} className={`pd-step ${st.status}`} style={st.status !== "next" ? { borderColor: st.status === "active" ? accent : primary } : undefined}>
                <span className="pd-step-dot" style={{ background: st.status === "next" ? "#9ca3af55" : st.status === "active" ? accent : primary }}>
                  {st.status === "done" ? "✓" : i + 1}
                </span>
                <div><b>{st.name}</b><p>{st.detail}</p></div>
              </div>
            ))}
          </div>
        )}

        {demo.kind === "mockup" && (
          <div className="pd-mock">
            <div className="pd-mock-nav">
              <b style={{ color: primary }}>{buyerName}</b>
              {demo.nav.map((n, i) => <span key={i}>{n}</span>)}
            </div>
            <div className="pd-mock-hero" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
              <h4>{demo.hero_headline}</h4>
              <p>{demo.hero_sub}</p>
              <span className="pd-mock-cta" style={{ color: primary }}>{demo.hero_cta}</span>
            </div>
            {demo.cards.length > 0 && (
              <div className="pd-mock-cards">
                {demo.cards.map((c, i) => (
                  <div key={i} style={{ borderTop: `3px solid ${accent}` }}><b>{c.title}</b><p>{c.body}</p></div>
                ))}
              </div>
            )}
          </div>
        )}

        {demo.kind === "report" && (
          <div className="pd-report">
            {demo.score && <div className="pd-score" style={{ borderColor: primary, color: primary }}>{demo.score}</div>}
            {demo.findings.map((f, i) => (
              <div key={i} className="pd-finding">
                <span className={`pd-level ${f.level}`}>{f.level === "good" ? "✓" : f.level === "warn" ? "!" : "✕"}</span>
                <div><b>{f.area}</b><p>{f.finding}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
