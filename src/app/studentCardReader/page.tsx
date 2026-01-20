"use client";

import { useState } from "react";

export default function NfcTestPage() {
  const [log, setLog] = useState<string>("");

  async function startScan() {
    try {
      // @ts-ignore - TS may not know Web NFC types depending on your setup
      if (!("NDEFReader" in window)) {
        setLog(
          "Web NFC not supported on this browser/device. Try Chrome on Android."
        );
        return;
      }

      // @ts-ignore
      const reader = new NDEFReader();

      // @ts-ignore
      await reader.scan();
      setLog("Scan started. Tap an NFC tag/card to the phone.");

      // @ts-ignore
      reader.onreading = async (event: any) => {
        const lines: string[] = [];

        lines.push("✅ NFC tag detected");
        lines.push(`serialNumber: ${event.serialNumber ?? "(none)"}`);

        const records = event.message?.records ?? [];
        lines.push(`records: ${records.length}`);

        // Helper to turn ArrayBuffer/DataView into hex
        const toHex = (buf: ArrayBuffer | DataView) => {
          const ab = buf instanceof DataView ? buf.buffer : buf;
          const bytes = new Uint8Array(ab);
          return [...bytes]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" ");
        };

        for (let i = 0; i < records.length; i++) {
          const r = records[i];
          lines.push("");
          lines.push(`--- record #${i + 1} ---`);
          lines.push(`recordType: ${r.recordType}`);
          lines.push(`mediaType: ${r.mediaType ?? "(none)"}`);
          lines.push(`id: ${r.id ?? "(none)"}`);
          lines.push(`encoding: ${r.encoding ?? "(none)"}`);
          lines.push(`lang: ${r.lang ?? "(none)"}`);

          try {
            // Try decode via text()
            if (typeof r.text === "function") {
              const t = await r.text();
              lines.push(`text(): ${t}`);
            }
          } catch (e: any) {
            lines.push(`text() error: ${e?.message ?? String(e)}`);
          }

          // Raw bytes (if available)
          try {
            if (r.data) {
              lines.push(`data(hex): ${toHex(r.data)}`);
            } else {
              lines.push("data: (none)");
            }
          } catch (e: any) {
            lines.push(`data read error: ${e?.message ?? String(e)}`);
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
