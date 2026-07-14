"use client";

// Motion layer for hosted proposal pages: scroll progress bar (in the
// prospect's accent color) + reveal-on-scroll via IntersectionObserver.
// Respects prefers-reduced-motion; zero dependencies.

import { useEffect, useState } from "react";

export default function ProposalFx({ accent }: { accent: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("js");

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  return (
    <div aria-hidden style={{
      position: "fixed", top: 0, left: 0, height: 3, zIndex: 50,
      width: `${progress}%`, background: accent, transition: "width 80ms linear",
    }} />
  );
}
