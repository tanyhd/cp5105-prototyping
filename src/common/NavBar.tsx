import Link from "next/link";

export default function NavBar() {
  return (
    <nav
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        borderBottom: "1px solid #ddd",
      }}
    >
      <Link href="/">Home</Link>
      <Link href="/qrCodeScanner">QR Scanner</Link>
      <Link href="/telegramBot">Telegram Bot</Link>
      <Link href="/studentCardReader">Student Card Reader</Link>

    </nav>
  );
}
