"use client";

// "What if Clay pitched Ramp?" — auto-advancing carousel of REAL kits Uniq
// generated, each card wearing the pitching tool's brand. Every link opens a
// live hosted proposal. Pause on hover; arrows for humans.

import { useEffect, useState } from "react";

export interface ExampleKit {
  seller: string; prospect: string;
  sellerColor: string; prospectColor: string;
  subject: string; url: string;
}

export default function ExampleCarousel({ kits }: { kits: ExampleKit[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || kits.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % kits.length), 3800);
    return () => clearInterval(t);
  }, [paused, kits.length]);

  if (!kits.length) return null;
  const k = kits[i];

  return (
    <div className="xc" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="xc-card" key={i} style={{ borderColor: k.sellerColor }}>
        <div className="xc-head">
          <span className="xc-pill" style={{ background: k.sellerColor }}>{k.seller}</span>
          <span className="xc-vs">pitching</span>
          <span className="xc-pill" style={{ background: k.prospectColor }}>{k.prospect}</span>
        </div>
        <p className="xc-what">What if <strong>{k.seller}</strong> used Uniq to pitch <strong>{k.prospect}</strong>?</p>
        <p className="xc-subject">✉ “{k.subject}”</p>
        <a className="xc-open" href={k.url} target="_blank" rel="noreferrer" style={{ background: k.sellerColor }}>
          Open the real proposal — in {k.prospect}&apos;s brand →
        </a>
      </div>
      <div className="xc-nav">
        <button aria-label="Previous" onClick={() => setI((i - 1 + kits.length) % kits.length)}>←</button>
        <div className="xc-dots">
          {kits.map((_, d) => (
            <button key={d} aria-label={`Example ${d + 1}`} className={d === i ? "on" : ""} onClick={() => setI(d)} />
          ))}
        </div>
        <button aria-label="Next" onClick={() => setI((i + 1) % kits.length)}>→</button>
      </div>
    </div>
  );
}
