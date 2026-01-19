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

      {/* add more later */}
      {/* <Link href="/test1">Test 1</Link> */}
    </nav>
  );
}
