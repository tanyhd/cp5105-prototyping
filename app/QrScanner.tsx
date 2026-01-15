"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QrScanner() {
  const [result, setResult] = useState<{
    studentId: string;
    unixSeconds: number;
    registeredAtLocal: string;
    timeZone: string;
  } | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const readerId = "reader";

  useEffect(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      readerId,
      { fps: 10, qrbox: 250 },
      /* verbose */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        const parsed = parseScan(decodedText);
        if (!parsed) {
          return;
        }
        setResult(parsed);
        scanner.clear().catch(() => {});
        scannerRef.current = null;
      },
      (_error) => {
        // ignore scan errors to avoid noisy logs
      }
    );

    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  return (
    <div>
      <div id={readerId} />
      {result && (
        <div>
          <div>Student ID: {result.studentId}</div>
          <div>Registered time: {result.registeredAtLocal}</div>
          <div>Time zone: {result.timeZone}</div>
        </div>
      )}
    </div>
  );
}

function parseScan(decodedText: string) {
  const parts = decodedText.split(";");

  const studentId = parts[0]?.trim() ?? "";
  const tsStr = parts[1]?.trim() ?? "";

  const unixSeconds = Number(tsStr);
  if (!studentId || !Number.isFinite(unixSeconds)) return null;

  const registeredAt = new Date(unixSeconds * 1000); // seconds -> milliseconds
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // browser timezone

  const registeredAtLocal = registeredAt.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  return { studentId, unixSeconds, registeredAtLocal, timeZone: tz };
}
