// Persistence — Supabase when configured, otherwise a process-local in-memory
// store so the self-hosted engine runs with zero infrastructure (proposals
// then live only for the process lifetime; fine for local/CLI use).

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { SellerProfile, ProspectBrief, ClosingKit } from "./generate";

export interface ProposalRecord {
  id: string;
  seller_domain: string;
  prospect_domain: string;
  seller_profile: SellerProfile;
  prospect_brief: ProspectBrief;
  kit: ClosingKit;
  views: number;
  webhook_url?: string | null;
  created_at: string;
}

function supa(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const mem = {
  profiles: new Map<string, SellerProfile>(),
  proposals: new Map<string, ProposalRecord>(),
};

export function newId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(9)))
    .map((b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
}

// ─── Seller profiles (persistent, keyed by domain) ───────────────────────────

export async function getSellerProfile(domain: string): Promise<SellerProfile | null> {
  const db = supa();
  if (!db) return mem.profiles.get(domain) ?? null;
  const { data } = await db.from("uniq_seller_profiles").select("profile").eq("domain", domain).maybeSingle();
  return (data?.profile as SellerProfile) ?? null;
}

export async function saveSellerProfile(domain: string, profile: SellerProfile): Promise<void> {
  const db = supa();
  if (!db) { mem.profiles.set(domain, profile); return; }
  await db.from("uniq_seller_profiles").upsert({ domain, profile, updated_at: new Date().toISOString() });
}

// ─── Proposals ────────────────────────────────────────────────────────────────

export async function saveProposal(rec: ProposalRecord): Promise<void> {
  const db = supa();
  if (!db) { mem.proposals.set(rec.id, rec); return; }
  await db.from("uniq_proposals").insert({
    id: rec.id,
    seller_domain: rec.seller_domain,
    prospect_domain: rec.prospect_domain,
    seller_profile: rec.seller_profile,
    prospect_brief: rec.prospect_brief,
    kit: rec.kit,
    webhook_url: rec.webhook_url ?? null,
  });
}

/** Replace a proposal's kit after a prompt-based edit. */
export async function saveProposalKit(id: string, kit: ClosingKit): Promise<void> {
  const db = supa();
  if (!db) {
    const p = mem.proposals.get(id);
    if (p) p.kit = kit;
    return;
  }
  await db.from("uniq_proposals").update({ kit }).eq("id", id);
}

export async function getProposal(id: string): Promise<ProposalRecord | null> {
  const db = supa();
  if (!db) return mem.proposals.get(id) ?? null;
  const { data } = await db.from("uniq_proposals").select("*").eq("id", id).maybeSingle();
  return (data as ProposalRecord) ?? null;
}

export async function recordView(id: string): Promise<void> {
  const db = supa();
  let firstView = false;
  if (!db) {
    const p = mem.proposals.get(id);
    if (p) { firstView = p.views === 0; p.views++; }
  } else {
    const before = await getProposal(id);
    firstView = (before?.views ?? 0) === 0;
    await db.rpc("uniq_increment_views", { proposal_id: id }).then(
      () => undefined,
      () => undefined, // view tracking is best-effort, never breaks the page
    );
  }
  // Engagement webhook — the signal an outbound agent acts on ("they opened
  // it → follow up"). Fired on the FIRST view only; best-effort.
  if (firstView) {
    const p = await getProposal(id);
    if (p) {
      const { notifyTelegram } = await import("./notify");
      void notifyTelegram(`👀 <b>Proposal opened</b> — ${p.prospect_domain} (${p.seller_domain})\nhttps://uniq.team/p/${id}`);
    }
    if (p?.webhook_url) {
      fetch(p.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "proposal.viewed",
          proposal_id: id,
          prospect_domain: p.prospect_domain,
          at: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => undefined);
    }
  }
}

/** Daily global counters for unauthenticated endpoints — cost control. */
export async function bumpUsage(kind: "playground" | "profile" | "brand"): Promise<number | null> {
  const db = supa();
  if (!db) return null;
  const day = new Date().toISOString().slice(0, 10);
  await db.from("uniq_usage").upsert({ day }, { onConflict: "day", ignoreDuplicates: true });
  const { data } = await db.from("uniq_usage").select(kind).eq("day", day).maybeSingle();
  const next = (((data as Record<string, number> | null)?.[kind]) ?? 0) + 1;
  await db.from("uniq_usage").update({ [kind]: next }).eq("day", day);
  return next;
}
export const bumpPlaygroundUsage = () => bumpUsage("playground");

export async function getEngagement(id: string): Promise<{ id: string; views: number } | null> {
  const p = await getProposal(id);
  return p ? { id, views: p.views ?? 0 } : null;
}
