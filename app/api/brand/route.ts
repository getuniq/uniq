// GET /api/brand?url=… — instant brand extraction, the landing-page hero demo.
// Crawl-only (no LLM, no auth): returns the prospect's colors, fonts, and logo
// candidates in a few seconds. This is the "watch us pull their brand" moment.

import { NextRequest, NextResponse } from "next/server";
import { crawlSite, pickLogo } from "@/lib/crawl";
import { bumpUsage } from "@/lib/store";

export const maxDuration = 60;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });
  const used = await bumpUsage("brand");
  if (used !== null && used > 400) return NextResponse.json({ error: "Rate limited — try again tomorrow" }, { status: 429 });
  try {
    const site = await crawlSite(url);
    const logo = await pickLogo(site.logoCandidates.slice(0, 4));
    return NextResponse.json({
      domain: site.domain,
      title: site.title,
      description: site.description.slice(0, 200),
      colors: site.colorCandidates.slice(0, 5),
      fonts: site.fontCandidates.slice(0, 3),
      logo,
    });
  } catch (e) {
    return NextResponse.json({ error: `Couldn't read that site: ${String(e instanceof Error ? e.message : e).slice(0, 120)}` }, { status: 422 });
  }
}
