import Link from "next/link";

export default function NavBar() {
  const linkStyle: React.CSSProperties = {
    padding: "6px 10px",
    border: "1px solid currentColor",
    borderRadius: 8,
    textDecoration: "none",
    color: "inherit",
  };

  return (
    <nav
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        borderBottom: "1px solid #333",
        background: "rgba(0,0,0,0.2)",
      }}
    >
      <Link href="/" style={linkStyle}>
        Home
      </Link>
      <Link href="/qrCodeScanner" style={linkStyle}>
        QR Scanner
      </Link>
      <Link href="/telegramBot" style={linkStyle}>
        Telegram Bot
      </Link>
      <Link href="/studentCardReader" style={linkStyle}>
        Student Card Reader
      </Link>
      <Link href="/nus-sync" style={linkStyle}>
        Load nus sync data
      </Link>
    </nav>
  );
}
