import QRCode from "qrcode";
import { headers } from "next/headers";

export const runtime = "nodejs";

export default async function TelegramBotPage() {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botUsername || !botToken) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Telegram Bot QR</h1>
        <p>Missing env var: TELEGRAM_BOT_USERNAME or TELEGRAM_BOT_TOKEN</p>
      </main>
    );
  }

  // Derive deployed URL from request headers and auto-register the webhook
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const webhookUrl = `${proto}://${host}/api/telegram/webhook`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
  } catch {
    // Non-fatal — webhook may already be set
  }

  const payload = "test_event_2"; // use different payloads for different events
  const url = `https://t.me/${botUsername}?start=${payload}`;

  const dataUrl = await QRCode.toDataURL(url, {
    width: 360,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  return (
    <main style={{ padding: 16 }}>
      <h1>Telegram Bot QR</h1>

      <p style={{ marginBottom: 8 }}>
        Scan to open the bot (first time user still needs to tap <b>Start</b>).
      </p>

      <img
        src={dataUrl}
        alt="Telegram bot QR"
        style={{ width: 240, height: 240 }}
      />

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Deep link:</div>
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      </div>
    </main>
  );
}
