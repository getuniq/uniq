"use client";

// Honest staged loader for long waits (profile ~30s, kit ~60-90s): cycles
// through named stages with a progress shimmer so the wait feels like work
// being done — because it is.

import { useEffect, useState } from "react";

export default function StagedLoader({ stages, cycleMs = 5200 }: { stages: string[]; cycleMs?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => Math.min(v + 1, stages.length - 1)), cycleMs);
    return () => clearInterval(t);
  }, [stages.length, cycleMs]);
  return (
    <div className="sloader" role="status" aria-live="polite">
      <span className="sloader-ring" />
      <div className="sloader-text">
        <strong key={i}>{stages[i]}</strong>
        <span>step {Math.min(i + 1, stages.length)} of {stages.length}</span>
      </div>
      <div className="sloader-bar"><i /></div>
    </div>
  );
}
