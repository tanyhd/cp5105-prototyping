import Image from "next/image";
import QrScanner from "./QrScanner";

export default function Home() {
  return (
    <main>
      <h1>QR Scanner</h1>
      <QrScanner />
    </main>
    
  );
}
