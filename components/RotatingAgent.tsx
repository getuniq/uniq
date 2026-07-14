"use client";

// Rotating agent-name in the hero badge (Oxygen pattern) — width-animated so
// the sentence resizes smoothly per name.

import { useEffect, useState } from "react";

const AGENTS = ["Claude Code", "Cursor", "Clay", "n8n", "ChatGPT", "your agent"];

export default function RotatingAgent() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % AGENTS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="rot-agent" style={{ width: `${AGENTS[i].length * 0.62}em` }}>
      <b key={i}>{AGENTS[i]}</b>
    </span>
  );
}
