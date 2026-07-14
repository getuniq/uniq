// Hosted proposal page v2 — the close, designed to need zero tweaks.
// Rendered entirely in the PROSPECT's brand (colors, type, logo) with the
// motion DNA of our best hand-built proposals: layered gradient hero, scroll
// progress in their accent, reveal-on-scroll sections, hover-lift cards,
// staggered proof, pulsing CTA. Reduced-motion respected throughout.

import { getProposal, recordView } from "@/lib/store";
import ProposalFx from "@/components/ProposalFx";
import BrandLogo from "@/components/BrandLogo";
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

/** #rrggbb + alpha → rgba() */
function tint(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  const primary = b.primary_color, accent = b.accent_color;

  return (
    <main className="pp" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Brand-scoped design system + motion. Dynamic tokens → inline <style>. */}
      <style>{`
        .pp { color: #17181c; line-height: 1.65; background: #fcfcfc; }
        .pp .wrap { max-width: 780px; margin: 0 auto; padding: 0 1.5rem; }
        .pp .eyebrow { font-size: 0.8rem; letter-spacing: 2.5px; text-transform: uppercase; opacity: 0.85; font-weight: 600; }

        .pp .hero {
          position: relative; color: #fff; overflow: hidden;
          background: linear-gradient(135deg, ${primary} 0%, ${tint(primary, 0.82)} 55%, ${tint(accent, 0.9)} 130%);
          padding: 5.5rem 0 5rem;
        }
        .pp .hero::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(900px 420px at 85% -10%, ${tint(accent, 0.35)}, transparent 60%),
                      radial-gradient(700px 380px at -10% 110%, rgba(255,255,255,0.14), transparent 55%);
        }
        .pp .hero .wrap { position: relative; }
        .pp .hero h1 { font-family: ${font}; font-size: clamp(2rem, 5vw, 3.1rem); line-height: 1.12; letter-spacing: -0.5px; margin: 1rem 0 0.8rem; max-width: 640px; }
        .pp .hero .subhead { font-size: 1.18rem; opacity: 0.93; max-width: 560px; }
        .pp .hero .brandrow { display: flex; align-items: center; gap: 0.9rem; margin-bottom: 2.2rem; }
        .pp .scrollcue { margin-top: 3rem; font-size: 0.85rem; opacity: 0.75; display: inline-flex; align-items: center; gap: 0.5rem; }
        .pp .scrollcue i { display: inline-block; width: 8px; height: 12px; border: 1.5px solid rgba(255,255,255,0.8); border-radius: 6px; position: relative; }
        .pp .scrollcue i::after { content: ""; position: absolute; left: 50%; top: 2px; width: 2px; height: 3px; margin-left: -1px; background: #fff; border-radius: 2px; animation: pp-wheel 1.6s infinite; }
        @keyframes pp-wheel { 0% { transform: translateY(0); opacity: 1 } 70% { transform: translateY(4px); opacity: 0 } 100% { opacity: 0 } }

        .pp section { padding: 3.2rem 0 0; }
        .pp h2 { font-family: ${font}; color: ${primary}; font-size: 1.55rem; letter-spacing: -0.3px; margin-bottom: 0.6rem; }
        .pp .prose { font-size: 1.04rem; max-width: 640px; }

        .pp .problem { border-left: 3.5px solid ${accent}; padding-left: 1.4rem; }

        .pp .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-top: 1.4rem; }
        .pp .dcard {
          background: #fff; border: 1px solid #e8e8ec; border-top: 3px solid ${accent};
          border-radius: 12px; padding: 1.3rem 1.4rem;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .pp .dcard:hover { transform: translateY(-4px); box-shadow: 0 14px 34px ${tint(primary, 0.13)}; }
        .pp .dcard .num { font-family: ui-monospace, Menlo, monospace; font-size: 0.78rem; color: ${accent}; font-weight: 700; letter-spacing: 1px; }
        .pp .dcard h3 { font-family: ${font}; font-size: 1.06rem; margin: 0.4rem 0 0.35rem; }
        .pp .dcard p { font-size: 0.94rem; color: #4b4d55; margin: 0; }

        .pp .proof { background: ${tint(primary, 0.055)}; border-radius: 14px; padding: 1.6rem 1.8rem; }
        .pp .proof p { margin: 0; padding: 0.45rem 0; font-size: 0.98rem; display: flex; gap: 0.6rem; }
        .pp .proof .tick { color: ${accent}; font-weight: 800; }

        .pp .pricing { border: 1.5px solid ${tint(primary, 0.25)}; border-radius: 14px; padding: 1.6rem 1.8rem; background: #fff; }

        .pp .ctawrap { text-align: center; padding: 3.4rem 0 4.5rem; }
        .pp .cta {
          display: inline-block; background: ${primary}; color: #fff; text-decoration: none;
          font-family: ${font}; font-weight: 700; font-size: 1.08rem;
          padding: 1rem 2.6rem; border-radius: 999px;
          box-shadow: 0 0 0 0 ${tint(primary, 0.4)};
          transition: transform 0.2s ease;
          animation: pp-pulse 2.6s infinite;
        }
        .pp .cta:hover { transform: translateY(-2px); }
        @keyframes pp-pulse { 0% { box-shadow: 0 0 0 0 ${tint(primary, 0.35)} } 70% { box-shadow: 0 0 0 16px ${tint(primary, 0)} } 100% { box-shadow: 0 0 0 0 ${tint(primary, 0)} } }
        .pp .ctasub { color: #6b6d76; font-size: 0.92rem; margin-top: 0.9rem; }

        .pp footer { border-top: 1px solid #ececf0; padding: 1.3rem; text-align: center; font-size: 0.8rem; color: #9a9ca4; }
        .pp footer a { color: #9a9ca4; }

        /* reveal-on-scroll (no-JS safe: visible by default, hidden only when .js) */
        .js .pp-reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .js .pp-reveal.in { opacity: 1; transform: none; }
        .js .pp-reveal:nth-child(2) { transition-delay: 0.08s; } .js .pp-reveal:nth-child(3) { transition-delay: 0.16s; } .js .pp-reveal:nth-child(4) { transition-delay: 0.24s; }
        @media (prefers-reduced-motion: reduce) {
          .js .pp-reveal { opacity: 1; transform: none; transition: none; }
          .pp .cta { animation: none; } .pp .scrollcue i::after { animation: none; }
        }
      `}</style>

      <ProposalFx accent={accent} />

      <header className="hero">
        <div className="wrap">
          <div className="brandrow">
            <BrandLogo src={b.logo_url} name={p.prospect_brief.company} color={primary} size={46} />
            <span className="eyebrow">Prepared for {p.prospect_brief.company} · by {seller.company}</span>
          </div>
          <h1>{pr.headline}</h1>
          <p className="subhead">{pr.subheadline}</p>
          <span className="scrollcue"><i /> scroll</span>
        </div>
      </header>

      <div className="wrap">
        <section className="reveal pp-reveal">
          <div className="problem">
            <h2>{pr.problem.title}</h2>
            <p className="prose">{pr.problem.body}</p>
          </div>
        </section>

        <section className="reveal pp-reveal">
          <h2>{pr.solution.title}</h2>
          <p className="prose">{pr.solution.body}</p>
        </section>

        <section className="reveal pp-reveal">
          <div className="cards">
            {pr.deliverables.map((d, i) => (
              <div key={i} className="dcard reveal pp-reveal">
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </div>
            ))}
          </div>
        </section>

        {pr.proof.length > 0 && (
          <section className="reveal pp-reveal">
            <div className="proof">
              {pr.proof.map((line, i) => (
                <p key={i}><span className="tick">✓</span><span>{line}</span></p>
              ))}
            </div>
          </section>
        )}

        <section className="reveal pp-reveal">
          <div className="pricing">
            <h2>{pr.pricing.title}</h2>
            <p className="prose" style={{ margin: 0 }}>{pr.pricing.body}</p>
          </div>
        </section>

        <div className="ctawrap reveal pp-reveal">
          <a className="cta" href={`mailto:?subject=${encodeURIComponent(`Re: ${p.kit.email.subject}`)}`}>
            {pr.cta.label}
          </a>
          <p className="ctasub">{pr.cta.sub}</p>
        </div>
      </div>

      <footer>
        Crafted with <a href="https://uniq.team">Uniq</a> — the open-source proposal engine
      </footer>
    </main>
  );
}
