// The two-URL flow — Uniq's whole product in one function.
// crawl seller (cached as a profile) + crawl prospect → one narrative,
// three artifacts → persisted, hosted, returned.

import { crawlSite, pickLogo } from "./crawl";
import { buildSellerProfile, buildProspectBrief, generateClosingKit } from "./generate";
import { saveSellerProfile, getSellerProfile, saveProposal, newId } from "./store";

export interface CreateProposalInput {
  sellerUrl: string;
  prospectUrl: string;
  focus?: string;          // optional operator steer ("lead with the API angle")
  refreshSeller?: boolean; // bypass the cached seller profile
  webhookUrl?: string;     // POSTed { event: "proposal.viewed", ... } on first view
}

export interface CreateProposalOutput {
  id: string;
  proposalUrl: string;     // hosted, prospect-branded page
  email: { subject: string; body: string };
  pitchHtml: string;       // self-contained HTML one-pager
  narrative: string;
  prospect: { company: string; domain: string };
}

export function baseUrl(): string {
  const configured = process.env.UNIQ_BASE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3007";
}

export async function createProposal(input: CreateProposalInput): Promise<CreateProposalOutput> {
  // 1. Seller profile — cached by domain; a seller crawls once, sells many times.
  const sellerDomain = new URL(/^https?:\/\//.test(input.sellerUrl) ? input.sellerUrl : `https://${input.sellerUrl}`)
    .hostname.replace(/^www\./, "");
  let seller = input.refreshSeller ? null : await getSellerProfile(sellerDomain);
  if (!seller) {
    const sellerSite = await crawlSite(input.sellerUrl);
    seller = await buildSellerProfile(sellerSite);
    await saveSellerProfile(sellerDomain, seller);
  }

  // 2. Prospect brief + brand extraction — fresh every time.
  const prospectSite = await crawlSite(input.prospectUrl);
  const prospect = await buildProspectBrief(prospectSite);

  // Never ship an unvalidated logo URL — broken logos read as a broken product.
  prospect.brand.logo_url = await pickLogo([
    ...(prospect.brand.logo_url ? [prospect.brand.logo_url] : []),
    ...prospectSite.logoCandidates,
  ]);

  // 3. One narrative, three artifacts.
  const id = newId();
  const proposalUrl = `${baseUrl()}/p/${id}`;
  const kit = await generateClosingKit(seller, prospect, proposalUrl, input.focus);

  await saveProposal({
    id,
    seller_domain: sellerDomain,
    prospect_domain: prospectSite.domain,
    seller_profile: seller,
    prospect_brief: prospect,
    kit,
    views: 0,
    webhook_url: input.webhookUrl ?? null,
    created_at: new Date().toISOString(),
  });

  return {
    id,
    proposalUrl,
    email: kit.email,
    pitchHtml: kit.pitch_html,
    narrative: kit.narrative,
    prospect: { company: prospect.company, domain: prospectSite.domain },
  };
}
