// Operator notifications — Telegram bridge for high-intent signals
// (proposal.question, first views). Env-gated; silently off when unset.

export async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.UNIQ_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.UNIQ_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
  } catch { /* best-effort */ }
}
