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
  verified?: boolean;
  verify_code?: string | null;
}

/** Send the 6-digit verification code via Resend (best-effort; env-gated). */
async function sendVerifyEmail(email: string, code: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false; // no mailer configured → caller falls back to auto-verify
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.UNIQ_EMAIL_FROM ?? "Uniq <onboarding@resend.dev>",
        to: [email],
        subject: `${code} — your Uniq code`,
        text: `Your Uniq verification code is: ${code}

Paste it back on uniq.team/start and your API key is yours.

— Uniq, the open-source proposal engine`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch { return false; }
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
  if (existing) {
    // Returning user → magic-code login. Never reveal the key without proving
    // email ownership (otherwise anyone could claim any account by re-signing up).
    const user = existing as UniqUser;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const sent = await sendVerifyEmail(clean, code);
    if (!sent) return user; // no mailer configured → self-host convenience
    await db.from("uniq_users").update({ verify_code: code }).eq("id", user.id);
    return { ...user, verify_code: code, verified: false }; // signal: code required
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const user: UniqUser = {
    id: newId(),
    email: clean,
    domain,
    api_key: `uq_${newId()}${newId()}`,
    proposals_used: 0,
    proposals_cap: 5,
    verified: false,
    verify_code: code,
  };
  const sent = await sendVerifyEmail(clean, code);
  if (!sent) { user.verified = true; user.verify_code = null; } // no mailer → don't lock users out
  const { error } = await db.from("uniq_users").insert(user);
  if (error) throw new Error(`Signup failed: ${error.message}`);
  return user;
}

/** Check a verification code; on match, mark verified and return the user. */
export async function verifyUser(email: string, code: string): Promise<UniqUser | null> {
  const db = supa();
  if (!db) return null;
  const { data } = await db.from("uniq_users").select("*").eq("email", email.trim().toLowerCase()).maybeSingle();
  const user = data as UniqUser | null;
  if (!user) return null;
  if (user.verify_code) {
    if (user.verify_code !== code.trim()) return null;
    await db.from("uniq_users").update({ verified: true, verify_code: null }).eq("id", user.id);
    return { ...user, verified: true, verify_code: null };
  }
  return user.verified ? user : null;
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
  if (!data) return { kind: "invalid" };
  const user = data as UniqUser;
  if (user.verified === false) return { kind: "invalid" }; // unverified keys don't work yet
  return { kind: "user", user };
}

export async function chargeProposal(user: UniqUser): Promise<{ ok: boolean; remaining: number }> {
  const db = supa();
  if (!db) return { ok: true, remaining: 999 };
  if (user.proposals_used >= user.proposals_cap) return { ok: false, remaining: 0 };
  await db.from("uniq_users").update({ proposals_used: user.proposals_used + 1 }).eq("id", user.id);
  return { ok: true, remaining: user.proposals_cap - user.proposals_used - 1 };
}
