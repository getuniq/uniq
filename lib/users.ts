// Self-serve accounts — v0 of the cloud platform. Email + own API key +
// free-tier cap (5 proposals). No password: the key IS the credential;
// email verification arrives with the full cloud build.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { newId } from "./store";

export interface UniqUser {
  id: string;
  email: string;
  domain: string;
  api_key: string;
  proposals_used: number;
  proposals_cap: number;
}

function supa(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function signupUser(email: string, domain: string): Promise<UniqUser> {
  const db = supa();
  if (!db) throw new Error("Signups need the database (SUPABASE_URL) — self-host runs keyless instead.");
  const clean = email.trim().toLowerCase();

  const { data: existing } = await db.from("uniq_users").select("*").eq("email", clean).maybeSingle();
  if (existing) return existing as UniqUser; // idempotent — returning users get their key back

  const user: UniqUser = {
    id: newId(),
    email: clean,
    domain,
    api_key: `uq_${newId()}${newId()}`,
    proposals_used: 0,
    proposals_cap: 5,
  };
  const { error } = await db.from("uniq_users").insert(user);
  if (error) throw new Error(`Signup failed: ${error.message}`);
  return user;
}

/** Resolve a bearer key: admin env key → unlimited; user key → cap-checked. */
export async function resolveApiKey(bearer: string | null): Promise<
  { kind: "admin" } | { kind: "user"; user: UniqUser } | { kind: "anon" } | { kind: "invalid" }
> {
  const admin = process.env.UNIQ_API_KEY;
  if (!bearer) return admin ? { kind: "invalid" } : { kind: "anon" }; // keyless self-host stays open
  const token = bearer.replace(/^Bearer\s+/i, "");
  if (admin && token === admin) return { kind: "admin" };
  const db = supa();
  if (!db) return { kind: "invalid" };
  const { data } = await db.from("uniq_users").select("*").eq("api_key", token).maybeSingle();
  return data ? { kind: "user", user: data as UniqUser } : { kind: "invalid" };
}

export async function chargeProposal(user: UniqUser): Promise<{ ok: boolean; remaining: number }> {
  const db = supa();
  if (!db) return { ok: true, remaining: 999 };
  if (user.proposals_used >= user.proposals_cap) return { ok: false, remaining: 0 };
  await db.from("uniq_users").update({ proposals_used: user.proposals_used + 1 }).eq("id", user.id);
  return { ok: true, remaining: user.proposals_cap - user.proposals_used - 1 };
}
