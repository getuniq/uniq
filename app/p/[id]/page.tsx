// Hosted proposal page — the close. Rendered in the PROSPECT's branding
// (their colors, their font, their logo) from the structured proposal JSON.
// This page is what the seller shares on reply; views are tracked best-effort.

import { getProposal, recordView } from "@/lib/store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProposal(id);
  if (!p) return { title: "Proposal not found" };
  return {
    title: `${p.kit.proposal.headline} — for ${p.prospect_brief.company}`,
    description: p.kit.proposal.subheadline,
    robots: { index: false }, // proposals are private-by-obscurity, never indexed
  };
}

export default async function ProposalPage({ params }: Props) {
  const { id } = await params;
  const p = await getProposal(id);
  if (!p) {
    return (
      <main style={{ fontFamily: "system-ui", padding: "6rem 2rem", textAlign: "center" }}>
        <h1>Proposal not found</h1>
        <p style={{ color: "#666" }}>This link may have expired or been removed.</p>
      </main>
    );
  }
  void recordView(id);

  const b = p.prospect_brief.brand;
  const pr = p.kit.proposal;
  const seller = p.seller_profile;
  const font = `'${b.heading_font}', system-ui, -apple-system, sans-serif`;

  return (
    <main style={{ fontFamily: "system-ui, -apple-system, sans-serif", color: "#1a1a1a", lineHeight: 1.6 }}>
      {/* Hero — prospect-branded */}
      <header style={{ background: b.primary_color, color: "#fff", padding: "4.5rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {b.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.logo_url} alt={p.prospect_brief.company} style={{ height: 40, marginBottom: "2rem", borderRadius: 8, background: "#fff", padding: 6 }} />
          )}
          <p style={{ opacity: 0.85, fontSize: 14, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
            Prepared for {p.prospect_brief.company} · by {seller.company}
          </p>
          <h1 style={{ fontFamily: font, fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)", margin: "0.8rem 0 0.6rem", lineHeight: 1.15 }}>
            {pr.headline}
          </h1>
          <p style={{ fontSize: "1.15rem", opacity: 0.92, maxWidth: 640 }}>{pr.subheadline}</p>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Problem / Solution */}
        <section style={{ padding: "3rem 0 0" }}>
          <h2 style={{ fontFamily: font, color: b.primary_color, fontSize: "1.4rem" }}>{pr.problem.title}</h2>
          <p>{pr.problem.body}</p>
          <h2 style={{ fontFamily: font, color: b.primary_color, fontSize: "1.4rem", marginTop: "2rem" }}>{pr.solution.title}</h2>
          <p>{pr.solution.body}</p>
        </section>

        {/* Deliverables */}
        <section style={{ padding: "2.5rem 0 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {pr.deliverables.map((d, i) => (
              <div key={i} style={{ border: `1.5px solid ${b.accent_color}22`, borderTop: `3px solid ${b.accent_color}`, borderRadius: 10, padding: "1.2rem" }}>
                <h3 style={{ fontFamily: font, margin: "0 0 0.4rem", fontSize: "1.05rem" }}>{d.title}</h3>
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#444" }}>{d.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Proof */}
        {pr.proof.length > 0 && (
          <section style={{ padding: "2.5rem 0 0" }}>
            <div style={{ background: "#f7f7f8", borderRadius: 10, padding: "1.4rem 1.6rem" }}>
              {pr.proof.map((line, i) => (
                <p key={i} style={{ margin: i ? "0.6rem 0 0" : 0, fontSize: "0.95rem" }}>✓ {line}</p>
              ))}
            </div>
          </section>
        )}

        {/* Pricing */}
        <section style={{ padding: "2.5rem 0 0" }}>
          <h2 style={{ fontFamily: font, color: b.primary_color, fontSize: "1.4rem" }}>{pr.pricing.title}</h2>
          <p>{pr.pricing.body}</p>
        </section>

        {/* CTA */}
        <section style={{ padding: "2.5rem 0 4rem", textAlign: "center" }}>
          <a
            href={`mailto:?subject=${encodeURIComponent(`Re: ${p.kit.email.subject}`)}`}
            style={{
              display: "inline-block", background: b.primary_color, color: "#fff",
              padding: "0.9rem 2.2rem", borderRadius: 10, textDecoration: "none",
              fontFamily: font, fontSize: "1.05rem", fontWeight: 600,
            }}
          >
            {pr.cta.label}
          </a>
          <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.8rem" }}>{pr.cta.sub}</p>
        </section>
      </div>

      <footer style={{ borderTop: "1px solid #eee", padding: "1.2rem", textAlign: "center", fontSize: "0.8rem", color: "#999" }}>
        Crafted with <a href="https://uniq.team" style={{ color: "#999" }}>Uniq</a> — the open-source proposal engine
      </footer>
    </main>
  );
}
