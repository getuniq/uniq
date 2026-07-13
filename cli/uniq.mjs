#!/usr/bin/env node
// Uniq CLI — JSON in/out, built to sit inside n8n / Make / Clay / shell pipelines.
//
//   uniq propose --seller yoursaas.com --prospect acme.com [--focus "..."] [--host https://uniq.team]
//   uniq get --id x7k2m9q4p [--engagement]
//
// Env: UNIQ_HOST (default https://uniq.team), UNIQ_API_KEY (Bearer auth if the host requires it)

const args = process.argv.slice(2);
const cmd = args[0];

function flag(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? (args[i + 1]?.startsWith("--") ? "true" : args[i + 1] ?? "true") : undefined;
}

const HOST = (flag("host") ?? process.env.UNIQ_HOST ?? "https://uniq.team").replace(/\/+$/, "");
const KEY = process.env.UNIQ_API_KEY;

function headers() {
  const h = { "Content-Type": "application/json" };
  if (KEY) h.Authorization = `Bearer ${KEY}`;
  return h;
}

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

async function main() {
  if (cmd === "propose") {
    const seller = flag("seller"), prospect = flag("prospect");
    if (!seller || !prospect) die("Usage: uniq propose --seller <url> --prospect <url> [--focus '...']");
    process.stderr.write(`uniq: generating kit for ${prospect} (30-90s)...\n`);
    const res = await fetch(`${HOST}/api/proposal`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ sellerUrl: seller, prospectUrl: prospect, focus: flag("focus") }),
    });
    const json = await res.json();
    if (!res.ok) die(JSON.stringify(json));
    process.stdout.write(JSON.stringify(json, null, 2) + "\n");
  } else if (cmd === "get") {
    const id = flag("id");
    if (!id) die("Usage: uniq get --id <proposal_id> [--engagement]");
    const qs = flag("engagement") ? `id=${id}&engagement=1` : `id=${id}`;
    const res = await fetch(`${HOST}/api/proposal?${qs}`, { headers: headers() });
    const json = await res.json();
    if (!res.ok) die(JSON.stringify(json));
    process.stdout.write(JSON.stringify(json, null, 2) + "\n");
  } else {
    die(`uniq — the open-source, agent-native proposal engine (https://uniq.team)

Commands:
  propose --seller <url> --prospect <url> [--focus "..."]   generate a closing kit (JSON out)
  get --id <proposal_id> [--engagement]                     fetch a kit / its view stats

Env: UNIQ_HOST (default https://uniq.team) · UNIQ_API_KEY (if the host requires auth)`, 0);
  }
}

main().catch((e) => die(String(e)));
