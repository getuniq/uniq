"use client";

// Logo with a guaranteed-good fallback: if the validated URL still fails in
// the browser, render a brand-colored monogram instead. A broken image never
// reaches the prospect's eyes.

import { useState } from "react";

export default function BrandLogo({ src, name, color, size = 44 }: {
  src: string | null; name: string; color: string; size?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span aria-hidden style={{
        width: size, height: size, borderRadius: size * 0.22, background: "#fff",
        color, display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: size * 0.5, fontFamily: "system-ui, sans-serif",
      }}>
        {(name || "?").trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src} alt={name} width={size} height={size}
      onError={() => setFailed(true)}
      style={{ borderRadius: size * 0.22, background: "#fff", padding: size * 0.09, objectFit: "contain", width: size, height: size }}
    />
  );
}
