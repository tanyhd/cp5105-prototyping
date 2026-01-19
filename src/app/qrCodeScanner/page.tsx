"use client";

import { useCallback, useState } from "react";
import QrScanner, { type ScanResult } from "../../common/QrScanner";

type LogRow = ScanResult & { id: string };

export default function QrCodeScannerPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [armed, setArmed] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);

  const onScan = useCallback((result: ScanResult) => {
    setLogs((prev) => [{ ...result, id: crypto.randomUUID() }, ...prev,]);
    setArmed(false);
    setToastOpen(true);
  }, []);

  const armNext = () => {
    setToastOpen(false);
    setArmed(true);
  };

  return (
    <main style={{ padding: 16 }}>
      <h1>QR Scanner</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setLogs([])} disabled={logs.length === 0}>
          Clear table
        </button>
      </div>

     <QrScanner onScan={onScan} armed={armed} />

     {/* Popup overlay (click anywhere on it to scan next) */}
      {toastOpen && (
        <div
          onClick={armNext}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              background: "white",
              color: "#111",
              padding: "14px 16px",
              borderRadius: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              minWidth: 260,
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Scanned ✅</div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>
              Tap to scan next
            </div>
          </div>
        </div>
      )}

      {/* Table */}
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
