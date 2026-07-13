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
  });
}

export async function getProposal(id: string): Promise<ProposalRecord | null> {
  const db = supa();
  if (!db) return mem.proposals.get(id) ?? null;
  const { data } = await db.from("uniq_proposals").select("*").eq("id", id).maybeSingle();
  return (data as ProposalRecord) ?? null;
}

export async function recordView(id: string): Promise<void> {
  const db = supa();
  if (!db) {
    const p = mem.proposals.get(id);
    if (p) p.views++;
    return;
  }
  await db.rpc("uniq_increment_views", { proposal_id: id }).then(
    () => undefined,
    () => undefined, // view tracking is best-effort, never breaks the page
  );
}

export async function getEngagement(id: string): Promise<{ id: string; views: number } | null> {
  const p = await getProposal(id);
  return p ? { id, views: p.views ?? 0 } : null;
}
