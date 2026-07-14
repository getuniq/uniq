"use client";

// Self-playing product demo — the platform, running on loop inside the hero.
// Four steps: URLs in → brand extraction fires → artifacts wipe in → viewed
// ping → restart. Key-remounting restarts CSS animations; zero libraries.

import { useEffect, useState } from "react";

const STEPS = 4;
const STEP_MS = 2600;

export default function AppDemo() {
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStep((s) => {
        if (s + 1 >= STEPS) { setCycle((c) => c + 1); return 0; }
        return s + 1;
      });
    }, STEP_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="appdemo" key={cycle} aria-hidden>
      <div className="ad-chrome"><i /><i /><i /><span>app.uniq.team</span></div>
      <div className="ad-body">
        <div className="ad-side">
          <div className="ad-brandrow"><span className="ad-dot" />uniq.</div>
          <div className={`ad-navitem ${step >= 0 ? "on" : ""}`}>New proposal</div>
          <div className={`ad-navitem ${step >= 3 ? "on" : ""}`}>Engagement</div>
          <div className="ad-navitem">Seller profile</div>
        </div>
        <div className="ad-main">
          {/* step 0: inputs */}
          <div className={`ad-row ${step >= 0 ? "show" : ""}`}>
            <span className="ad-field">yoursaas.com</span>
            <span className="ad-arrow">→</span>
            <span className="ad-field hot">acme.com</span>
            <span className={`ad-run ${step === 0 ? "pulse" : ""}`}>Generate</span>
          </div>
          {/* step 1: brand extraction waterfall */}
          <div className={`ad-row ${step >= 1 ? "show" : ""}`}>
            <span className="ad-label">extracting acme&apos;s brand</span>
            {["#0af", "#f60", "#111"].map((c, i) => (
              <span key={i} className={`ad-chip ${step >= 1 ? "fire" : ""}`} style={{ animationDelay: `${i * 0.22}s` }}>
                <i style={{ background: c }} />{["primary", "accent", "type"][i]} ✓
              </span>
            ))}
          </div>
          {/* step 2: artifacts wipe in */}
          <div className={`ad-row arts ${step >= 2 ? "show" : ""}`}>
            {["✉ email — their pain, your voice", "▤ pitch.html — their colors", "◈ uniq.team/p/x7k2m — their logo"].map((t, i) => (
              <span key={i} className={`ad-art ${step >= 2 ? "wipe" : ""}`} style={{ animationDelay: `${i * 0.3}s` }}>{t}</span>
            ))}
          </div>
          {/* step 3: viewed ping */}
          <div className={`ad-row ${step >= 3 ? "show" : ""}`}>
            <span className="ad-ping"><i className="core" /><i className="halo" /></span>
            <span className="ad-label dark">proposal.viewed · acme.com · just now</span>
            <span className="ad-follow">→ follow up now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
