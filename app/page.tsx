"use client";

import { useCallback, useState } from "react";
import QrScanner, { type ScanResult } from "./QrScanner";

type LogRow = ScanResult & { id: string };

export default function Home() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [scanToken, setScanToken] = useState(0);

  const onScan = useCallback((result: ScanResult) => {
    setLogs((prev) => [
      { ...result, id: crypto.randomUUID() },
      ...prev,
    ]);
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <h1>QR Scanner</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setScanToken((t) => t + 1)}>Scan next</button>
        <button onClick={() => setLogs([])} disabled={logs.length === 0}>
          Clear table
        </button>
      </div>

      <QrScanner onScan={onScan} scanToken={scanToken} />

      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 6 }}>
                Student ID
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 6 }}>
                Registered At
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 6 }}>
                Signature
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 6 }}>
                Domain
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 6, borderBottom: "1px solid #eee" }}>{r.studentId}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #eee" }}>{r.registeredAtLocal}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #eee", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis"}}>{r.signature}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #eee" }}>{r.domain}</td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 10, opacity: 0.7 }}>
                  No scans yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
