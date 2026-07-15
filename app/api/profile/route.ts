// POST /api/profile — { sellerUrl } → live seller-profile build.
// The signup "aha": paste your URL, watch Uniq already know your pitch.
// No auth (it powers the signup flow); crawl+one model call, modest cost.

import { NextRequest, NextResponse } from "next/server";
import { crawlSite, pickLogo } from "@/lib/crawl";
import { buildSellerProfile } from "@/lib/generate";
import { saveSellerProfile, bumpUsage } from "@/lib/store";

export const maxDuration = 120;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const used = await bumpUsage("profile");
  if (used !== null && used > (parseInt(process.env.UNIQ_PROFILE_DAILY_CAP ?? "40", 10) || 40)) {
    return NextResponse.json({ error: "Signups are rate-limited right now — try again tomorrow or self-host (github.com/getuniq/uniq)." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({})) as { sellerUrl?: string };
  if (!body.sellerUrl) return NextResponse.json({ error: "sellerUrl is required" }, { status: 400 });
  try {
    const site = await crawlSite(body.sellerUrl);
    const [profile, logo] = await Promise.all([
      buildSellerProfile(site),
      pickLogo(site.logoCandidates.slice(0, 4)),
    ]);
    profile.brand = { primary_color: site.colorCandidates[0] ?? "#111827", logo_url: logo };
    profile.ctas = site.ctaLinks;
    await saveSellerProfile(site.domain, profile);
    return NextResponse.json({
      domain: site.domain,
      logo,
      colors: site.colorCandidates.slice(0, 4),
      profile: {
        company: profile.company,
        one_liner: profile.one_liner,
        value_props: profile.value_props.slice(0, 3),
        proof_points: profile.proof_points.slice(0, 2),
        tone: profile.tone,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
