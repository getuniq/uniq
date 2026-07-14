// Site crawling + content extraction — the input side of the engine.
// Deliberately dependency-free: fetch the page (+ a few same-origin subpages),
// strip to readable text, and collect the raw material brand extraction needs
// (inline colors, stylesheet URLs, og tags, favicon/logo candidates).

export interface CrawledSite {
  url: string;
  domain: string;
  title: string;
  description: string;
  text: string;              // readable text, capped
  ogImage: string | null;
  logoCandidates: string[];  // absolute URLs, best-first
  colorCandidates: string[]; // hex colors by frequency, best-first
  fontCandidates: string[];  // font-family names encountered
}

const UA = "Mozilla/5.0 (compatible; UniqBot/0.1; +https://uniq.team)";
const MAX_SUBPAGES = 3;
const TEXT_CAP = 9000;

function absolute(href: string, base: string): string | null {
  try { return new URL(href, base).toString(); } catch { return null; }
}

function stripToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|section|li|h[1-6]|tr|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ").replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function meta(html: string, name: string): string {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i");
  const alt = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, "i");
  return (html.match(re) ?? html.match(alt) ?? [])[1] ?? "";
}

function collectColors(css: string, tally: Map<string, number>): void {
  for (const m of css.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
    let hex = m[1].toLowerCase();
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    // Skip near-white/near-black/greys — they're never the brand color
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max > 240 && min > 230) continue;
    if (max < 35) continue;
    if (max - min < 18) continue; // grey
    tally.set(hex, (tally.get(hex) ?? 0) + 1);
  }
}

function collectFonts(css: string, out: Set<string>): void {
  for (const m of css.matchAll(/font-family\s*:\s*([^;}{]+)[;}]/gi)) {
    const first = m[1].split(",")[0].replace(/["']/g, "").trim();
    if (first && !/^(inherit|initial|unset|var\()/.test(first)) out.add(first);
  }
}

async function fetchText(url: string, timeoutMs = 12000): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,text/css,*/*" },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return await res.text();
}

/**
 * Server-side logo validation — returns the first candidate that actually
 * serves an image of plausible logo size. Never trust an unvalidated URL on
 * a proposal page; a broken logo reads as a broken product.
 */
export async function pickLogo(candidates: string[]): Promise<string | null> {
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "image/*" },
        signal: AbortSignal.timeout(6000),
        redirect: "follow",
      });
      if (!res.ok) continue;
      const type = res.headers.get("content-type") ?? "";
      if (!type.startsWith("image/")) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 400) continue; // tracking pixels / empty favicons
      return url;
    } catch { /* next candidate */ }
  }
  return null;
}

export async function crawlSite(inputUrl: string): Promise<CrawledSite> {
  const url = /^https?:\/\//.test(inputUrl) ? inputUrl : `https://${inputUrl}`;
  const html = await fetchText(url);
  const base = new URL(url);

  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) ?? [])[1]?.trim()
    ?? meta(html, "og:title") ?? "";
  const description = meta(html, "description") || meta(html, "og:description");
  const ogImage = meta(html, "og:image") ? absolute(meta(html, "og:image"), url) : null;

  // Logo candidates, best-first. Square marks beat banners: apple-touch-icon
  // and explicit logo <img> lead; og:image (usually a wide banner) comes last.
  // Google's favicon service closes the chain — it resolves for ~any domain.
  const logoCandidates: string[] = [];
  for (const rel of ["apple-touch-icon", "apple-touch-icon-precomposed"]) {
    const re = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']+)["']`, "i");
    const alt = new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["']${rel}["']`, "i");
    const href = (html.match(re) ?? html.match(alt) ?? [])[1];
    if (href) { const a = absolute(href, url); if (a) logoCandidates.push(a); }
  }
  const logoImg = (html.match(/<img[^>]+src=["']([^"']*logo[^"']*\.(?:svg|png|webp)[^"']*)["']/i) ?? [])[1];
  if (logoImg) { const a = absolute(logoImg, url); if (a && !logoCandidates.includes(a)) logoCandidates.push(a); }
  for (const rel of ["icon", "shortcut icon"]) {
    const re = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']+)["']`, "i");
    const alt = new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["']${rel}["']`, "i");
    const href = (html.match(re) ?? html.match(alt) ?? [])[1];
    if (href) { const a = absolute(href, url); if (a && !logoCandidates.includes(a)) logoCandidates.push(a); }
  }
  if (ogImage && !logoCandidates.includes(ogImage)) logoCandidates.push(ogImage);
  logoCandidates.push(`https://www.google.com/s2/favicons?domain=${base.hostname}&sz=128`);

  // Colors + fonts: inline HTML plus the first two same-origin stylesheets
  const colorTally = new Map<string, number>();
  const fonts = new Set<string>();
  collectColors(html, colorTally);
  collectFonts(html, fonts);
  const sheetHrefs = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)]
    .map((m) => absolute(m[1], url))
    .filter((h): h is string => !!h)
    .slice(0, 2);
  await Promise.allSettled(sheetHrefs.map(async (href) => {
    const css = await fetchText(href, 8000);
    collectColors(css, colorTally);
    collectFonts(css, fonts);
  }));

  // Pull a few high-signal same-origin subpages (about/pricing/product)
  const subpaths = new Set<string>();
  for (const m of html.matchAll(/<a[^>]+href=["']([^"'#?]+)["']/gi)) {
    const a = absolute(m[1], url);
    if (!a) continue;
    const u = new URL(a);
    if (u.origin !== base.origin) continue;
    if (/\/(about|pricing|product|features|services|solutions|how-it-works|customers)\/?$/i.test(u.pathname)) {
      subpaths.add(u.toString());
    }
    if (subpaths.size >= MAX_SUBPAGES) break;
  }
  const subTexts = await Promise.allSettled(
    [...subpaths].map(async (u) => stripToText(await fetchText(u, 8000)).slice(0, 2500)),
  );

  let text = stripToText(html);
  for (const st of subTexts) if (st.status === "fulfilled") text += `\n\n---\n${st.value}`;

  const colorCandidates = [...colorTally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hex]) => `#${hex}`);

  return {
    url,
    domain: base.hostname.replace(/^www\./, ""),
    title,
    description,
    text: text.slice(0, TEXT_CAP),
    ogImage,
    logoCandidates: logoCandidates.slice(0, 4),
    colorCandidates,
    fontCandidates: [...fonts].slice(0, 6),
  };
}
