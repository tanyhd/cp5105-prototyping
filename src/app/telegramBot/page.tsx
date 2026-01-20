import QRCode from "qrcode";

export const runtime = "nodejs";

export default async function TelegramBotPage() {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Telegram Bot QR</h1>
        <p>Missing env var: TELEGRAM_BOT_USERNAME</p>
      </main>
    );
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
