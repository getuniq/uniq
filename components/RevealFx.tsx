"use client";

// Reveal-on-scroll for marketing pages. Adds .js to <html>, then .in to any
// .reveal element as it enters the viewport. Reduced-motion handled in CSS.

import { useEffect } from "react";

export default function RevealFx() {
  useEffect(() => {
    document.documentElement.classList.add("js");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
