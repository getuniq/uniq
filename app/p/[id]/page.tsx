// Hosted proposal page v3 — the close. Three design personalities picked per
// prospect (gradient / editorial / midnight), CRO structure (outcome hero →
// stats → problem/solution → deliverables → proof → objections → priced ask,
// one primary action repeated), and DUAL BRAND: the page wears the prospect's
// identity, the sign-off carries the seller's.

import { getProposal, recordView } from "@/lib/store";
import ProposalFx from "@/components/ProposalFx";
import BrandLogo from "@/components/BrandLogo";
import AskBox from "@/components/AskBox";
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
    robots: { index: false },
  };
}

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
  const sellerBrand = seller.brand ?? { primary_color: "#111827", logo_url: null };
  const font = `'${b.heading_font}', system-ui, -apple-system, sans-serif`;
  const primary = b.primary_color, accent = b.accent_color;
  const variant = pr.design_variant ?? "gradient";

  // Variant palettes: page bg / ink / hero treatment
  const V = {
    gradient: {
      pageBg: "#fcfcfc", ink: "#17181c", soft: "#4b4d55", cardBg: "#fff", line: "#e8e8ec",
      heroBg: `linear-gradient(135deg, ${primary} 0%, ${tint(primary, 0.82)} 55%, ${tint(accent, 0.9)} 130%)`,
      heroInk: "#fff", heroGlow: `radial-gradient(900px 420px at 85% -10%, ${tint(accent, 0.35)}, transparent 60%), radial-gradient(700px 380px at -10% 110%, rgba(255,255,255,0.14), transparent 55%)`,
    },
    editorial: {
      pageBg: "#faf9f7", ink: "#1c1b18", soft: "#57544c", cardBg: "#fff", line: "#e7e4dd",
      heroBg: "#faf9f7", heroInk: "#1c1b18",
      heroGlow: `radial-gradient(700px 300px at 90% 0%, ${tint(primary, 0.08)}, transparent 60%)`,
    },
    midnight: {
      pageBg: "#0c0e12", ink: "#e8eaf0", soft: "#9aa0ad", cardBg: "#12151c", line: "#ffffff14",
      heroBg: `linear-gradient(160deg, #0c0e12 0%, ${tint(primary, 0.25)} 130%)`,
      heroInk: "#f4f5f8", heroGlow: `radial-gradient(800px 400px at 80% -10%, ${tint(primary, 0.3)}, transparent 60%)`,
    },
  }[variant];
  const heroEyebrow = variant === "editorial" ? primary : (variant === "midnight" ? accent : "#ffffffd9");

  return (
    <main className="pp" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        .pp { color: ${V.ink}; line-height: 1.65; background: ${V.pageBg}; }
        .pp .wrap { max-width: 780px; margin: 0 auto; padding: 0 1.5rem; }
        .pp .eyebrow { font-size: 0.8rem; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 600; color: ${heroEyebrow}; }

        .pp .hero { position: relative; overflow: hidden; background: ${V.heroBg}; color: ${V.heroInk};
          padding: ${variant === "editorial" ? "5rem 0 3.5rem" : "5.5rem 0 5rem"};
          ${variant === "editorial" ? `border-bottom: 3px solid ${primary};` : ""} }
        .pp .hero::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: ${V.heroGlow}; }
        .pp .hero .wrap { position: relative; }
        .pp .hero h1 { font-family: ${font}; font-size: clamp(2rem, 5vw, ${variant === "editorial" ? "3.4rem" : "3.1rem"});
          line-height: 1.1; letter-spacing: -0.5px; margin: 1rem 0 0.8rem; max-width: 660px; }
        .pp .hero .subhead { font-size: 1.18rem; opacity: 0.9; max-width: 560px; }
        .pp .hero .brandrow { display: flex; align-items: center; gap: 0.9rem; margin-bottom: 2.2rem; }

        .pp section { padding: 3.1rem 0 0; }
        .pp h2 { font-family: ${font}; color: ${variant === "midnight" ? accent : primary}; font-size: 1.5rem; letter-spacing: -0.3px; margin-bottom: 0.6rem; }
        .pp .prose { font-size: 1.04rem; max-width: 640px; color: ${V.ink}; }

        .pp .statsrow { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 2.4rem; }
        .pp .stat { flex: 1; min-width: 130px; background: ${variant === "gradient" ? "rgba(255,255,255,0.14)" : V.cardBg};
          border: 1px solid ${variant === "gradient" ? "rgba(255,255,255,0.25)" : V.line}; border-radius: 12px; padding: 0.9rem 1.1rem; }
        .pp .stat b { display: block; font-family: ${font}; font-size: 1.7rem; letter-spacing: -1px;
          color: ${variant === "gradient" ? "#fff" : primary}; }
        .pp .stat span { font-size: 0.82rem; opacity: 0.8; }

        .pp .quoteband { margin-top: 3.1rem; border-left: 4px solid ${accent}; padding: 0.4rem 0 0.4rem 1.5rem; }
        .pp .quoteband p { font-family: ${font}; font-size: 1.35rem; line-height: 1.45; letter-spacing: -0.3px; margin: 0; }

        .pp .problem { border-left: 3.5px solid ${accent}; padding-left: 1.4rem; }

        .pp .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-top: 1.4rem; }
        .pp .dcard { background: ${V.cardBg}; border: 1px solid ${V.line}; border-top: 3px solid ${accent};
          border-radius: 12px; padding: 1.3rem 1.4rem; transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .pp .dcard:hover { transform: translateY(-4px); box-shadow: 0 14px 34px ${tint(primary, variant === "midnight" ? 0.3 : 0.13)}; }
        .pp .dcard .num { font-family: ui-monospace, Menlo, monospace; font-size: 0.78rem; color: ${accent}; font-weight: 700; letter-spacing: 1px; }
        .pp .dcard h3 { font-family: ${font}; font-size: 1.06rem; margin: 0.4rem 0 0.35rem; color: ${V.ink}; }
        .pp .dcard p { font-size: 0.94rem; color: ${V.soft}; margin: 0; }

        .pp .midcta { text-align: center; margin-top: 2.8rem; }
        .pp .proof { background: ${variant === "midnight" ? tint(primary, 0.12) : tint(primary, 0.055)}; border-radius: 14px; padding: 1.6rem 1.8rem; }
        .pp .proof p { margin: 0; padding: 0.45rem 0; font-size: 0.98rem; display: flex; gap: 0.6rem; color: ${V.ink}; }
        .pp .proof .tick { color: ${accent}; font-weight: 800; }

        .pp .objections { margin-top: 0.6rem; }
        .pp details { background: ${V.cardBg}; border: 1px solid ${V.line}; border-radius: 12px; padding: 0.9rem 1.3rem; margin-bottom: 0.6rem; }
        .pp summary { cursor: pointer; font-weight: 600; font-family: ${font}; list-style: none; display: flex; justify-content: space-between; align-items: center; color: ${V.ink}; }
        .pp summary::after { content: "+"; font-size: 1.4rem; color: ${accent}; transition: transform 0.2s ease; }
        .pp details[open] summary::after { transform: rotate(45deg); }
        .pp details p { color: ${V.soft}; font-size: 0.96rem; margin: 0.6rem 0 0.2rem; }

        .pp .pricing { border: 1.5px solid ${tint(primary, variant === "midnight" ? 0.5 : 0.25)}; border-radius: 14px; padding: 1.6rem 1.8rem; background: ${V.cardBg}; }

        .pp .ctawrap { text-align: center; padding: 3.2rem 0 3rem; }
        .pp .cta { display: inline-block; background: ${variant === "midnight" ? accent : primary}; color: ${variant === "midnight" ? "#0c0e12" : "#fff"};
          text-decoration: none; font-family: ${font}; font-weight: 700; font-size: 1.08rem; padding: 1rem 2.6rem; border-radius: 999px;
          transition: transform 0.2s ease; animation: pp-pulse 2.6s infinite; }
        .pp .cta.ghost { background: transparent; border: 2px solid ${variant === "gradient" ? primary : accent}; color: ${variant === "midnight" ? accent : primary}; animation: none; font-size: 0.95rem; padding: 0.7rem 1.8rem; }
        .pp .cta:hover { transform: translateY(-2px); }
        @keyframes pp-pulse { 0% { box-shadow: 0 0 0 0 ${tint(primary, 0.35)} } 70% { box-shadow: 0 0 0 16px ${tint(primary, 0)} } 100% { box-shadow: 0 0 0 0 ${tint(primary, 0)} } }
        .pp .ctasub { color: ${V.soft}; font-size: 0.92rem; margin-top: 0.9rem; }

        .pp .sellerstrip { border-top: 3px solid ${sellerBrand.primary_color}; background: ${variant === "midnight" ? "#0a0c10" : "#fff"};
          padding: 1.6rem 0; }
        .pp .sellerstrip .wrap { display: flex; align-items: center; gap: 1rem; }
        .pp .sellerstrip .sig { font-family: ${font}; font-size: 1.02rem; color: ${V.ink}; }
        .pp .sellerstrip .from { font-size: 0.78rem; letter-spacing: 1.5px; text-transform: uppercase; color: ${V.soft}; display: block; }

        .pp footer { padding: 1.2rem; text-align: center; font-size: 0.8rem; color: ${V.soft}; }
        .pp footer a { color: ${V.soft}; }

        .pp .askbox { background: ${V.cardBg}; border: 1.5px solid ${V.line}; border-radius: 14px; padding: 1.3rem 1.5rem; max-width: 640px; margin: 0 auto; }
        .pp .askbox-title { font-family: ${font}; font-weight: 700; margin-bottom: 0.7rem; color: ${V.ink}; }
        .pp .askbox textarea, .pp .askbox input { width: 100%; border: 1.5px solid ${V.line}; border-radius: 9px; padding: 0.65rem 0.9rem; font-size: 0.95rem; font-family: inherit; background: ${variant === "midnight" ? "#0c0e12" : "#fff"}; color: ${V.ink}; resize: vertical; }
        .pp .askbox-row { display: flex; gap: 0.6rem; margin-top: 0.6rem; }
        .pp .askbox-row button { color: #fff; border: 0; border-radius: 9px; padding: 0.65rem 1.5rem; font-weight: 700; cursor: pointer; }
        .pp .askbox-row button:disabled { opacity: 0.6; }
        .pp .askbox-err { color: #dc2626; font-size: 0.85rem; margin-top: 0.5rem; }
        .pp .askbox-done { text-align: center; font-weight: 600; color: ${accent}; padding: 1rem; }

        .pp .uniqbar { display: flex; align-items: center; gap: 1rem; background: #0e1116; color: #9ca3af;
          padding: 0.5rem 1.2rem; font-size: 0.82rem; border-bottom: 2px dashed #374151; }
        .pp .uniqbar .ub-home { display: flex; align-items: center; }
        .pp .uniqbar .ub-note { flex: 1; }
        .pp .uniqbar .ub-cta { color: #a78bfa; font-weight: 700; text-decoration: none; white-space: nowrap; }
        .pp .uniqbar .ub-cta:hover { color: #c4b5fd; }

        .js .pp-reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .js .pp-reveal.in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .js .pp-reveal { opacity: 1; transform: none; transition: none; }
          .pp .cta { animation: none; }
        }
      `}</style>

      <ProposalFx accent={accent} />

      {/* Uniq preview bar — deliberately NOT in the prospect's brand, so it
          reads as the platform's frame, never part of the proposal itself. */}
      <div className="uniqbar" aria-label="Uniq platform bar">
        <a className="ub-home" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.svg" alt="uniq." height={20} />
        </a>
        <span className="ub-note">AI-generated proposal — crafted with Uniq</span>
        <a className="ub-cta" href="/start">Generate yours free →</a>
      </div>

      <header className="hero">
        <div className="wrap">
          <div className="brandrow">
            <BrandLogo src={b.logo_url} name={p.prospect_brief.company} color={primary} size={46} />
            <span className="eyebrow">Prepared for {p.prospect_brief.company} · by {seller.company}</span>
          </div>
          <h1>{pr.headline}</h1>
          <p className="subhead">{pr.subheadline}</p>
          {pr.stats && pr.stats.length > 0 && (
            <div className="statsrow">
              {pr.stats.map((s, i) => <div className="stat" key={i}><b>{s.value}</b><span>{s.label}</span></div>)}
            </div>
          )}
        </div>
      </header>

      <div className="wrap">
        {pr.quote && (
          <div className="quoteband reveal pp-reveal"><p>“{pr.quote}”</p></div>
        )}

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
              <div key={i} className="dcard">
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </div>
            ))}
          </div>
          <div className="midcta">
            <a className="cta ghost" href="#close">{pr.cta.label} ↓</a>
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

        {pr.objections && pr.objections.length > 0 && (
          <section className="reveal pp-reveal">
            <h2>You&apos;re probably thinking…</h2>
            <div className="objections">
              {pr.objections.map((o, i) => (
                <details key={i} open={i === 0}>
                  <summary>{o.q}</summary>
                  <p>{o.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="reveal pp-reveal" id="close">
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

        <div className="reveal pp-reveal" style={{ paddingBottom: "3rem" }}>
          <AskBox proposalId={id} primary={primary} sellerName={seller.company} />
        </div>
      </div>

      <div className="sellerstrip reveal pp-reveal">
        <div className="wrap">
          <BrandLogo src={sellerBrand.logo_url} name={seller.company} color={sellerBrand.primary_color} size={40} />
          <div>
            <span className="from">From {seller.company}</span>
            <span className="sig">{pr.signature ?? `— The ${seller.company} team`}</span>
          </div>
        </div>
      </div>

      <footer>
        Crafted with <a href="https://uniq.team">Uniq</a> — the open-source proposal engine
      </footer>
    </main>
  );
}
