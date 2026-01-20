"use client";

import { useState } from "react";

export default function NfcTestPage() {
  const [log, setLog] = useState<string>("");

  async function startScan() {
    try {
      // @ts-ignore - TS may not know Web NFC types depending on your setup
      if (!("NDEFReader" in window)) {
        setLog("Web NFC not supported on this browser/device. Try Chrome on Android.");
        return;
      }

      // @ts-ignore
      const reader = new NDEFReader();

      // @ts-ignore
      await reader.scan();
      setLog("Scan started. Tap an NFC tag/card to the phone.");

      // @ts-ignore
      reader.onreading = (event: any) => {
        const { message } = event;
        const lines: string[] = [];

        for (const record of message.records) {
          lines.push(`recordType=${record.recordType}, mediaType=${record.mediaType ?? ""}`);

          // Common case: text record
          if (record.recordType === "text") {
            const text = new TextDecoder().decode(record.data);
            lines.push(`text=${text}`);
          }

          // Common case: url record
          if (record.recordType === "url") {
            const url = new TextDecoder().decode(record.data);
            lines.push(`url=${url}`);
          }
        }

        setLog(lines.join("\n"));
      };

      // @ts-ignore
      reader.onreadingerror = () => {
        setLog("Tag read error (or tag/card isn’t NDEF).");
      };
    } catch (e: any) {
      setLog(`Error: ${e?.message ?? String(e)}`);
    }
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>NFC Test</h1>
      <button onClick={startScan}>Start NFC scan</button>
      <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{log}</pre>
    </main>
  );
}
