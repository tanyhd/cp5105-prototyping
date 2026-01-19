"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export type ScanResult = {
  studentId: string;
  unixSeconds: number;
  registeredAtLocal: string;
  timeZone: string;
  rawText: string;
  signature: string;
  domain: string;
};

type Props = {
  onScan: (result: ScanResult) => void;
  scanToken: number;
};

export default function QrScanner({onScan, scanToken}: Props) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const didScanRef = useRef(false);
  const seqRef = useRef(0);

  const readerId = "reader";

   const stopScanner = async () => {
    const s = scannerRef.current;
    if (!s) return;

    try {
      await s.clear();
    } catch {
      // ignore
    } finally {
      scannerRef.current = null;
      const el = document.getElementById(readerId);
      if (el) el.innerHTML = ""; // extra safety: remove leftover video DOM
    }
  };

  useEffect(() => {
    const seq = ++seqRef.current;
    let cancelled = false;

    (async () => {
      await stopScanner();
      if (cancelled || seq !== seqRef.current) return;

      didScanRef.current = false;

      const el = document.getElementById(readerId);
      if (!el) return; // should not happen, but prevents crash

      const scanner = new Html5QrcodeScanner(readerId, { fps: 10, qrbox: 250 }, false);
      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          if (didScanRef.current) return;

          const parsed = parseScan(decodedText);
          if (!parsed) return;

          didScanRef.current = true;
          onScan(parsed);

          await stopScanner(); // stop after one valid scan
        },
        () => {
          // ignore scan errors
        }
      );
    })();

    return () => {
      cancelled = true;
      didScanRef.current = true;
      stopScanner();
    };
  }, [scanToken, onScan]);

  return <div id={readerId} />;
}

function parseScan(decodedText: string): ScanResult | null {
  const parts = decodedText.split(";");

  const studentId = parts[0]?.trim() ?? "";
  const tsStr = parts[1]?.trim() ?? "";
  const qrCodeSignature = parts[2]?.trim() ?? "";
  const domain = parts[3]?.trim() ?? "";

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

  return {
    studentId,
    unixSeconds,
    registeredAtLocal,
    timeZone: tz,
    rawText: decodedText,
    signature: qrCodeSignature,
    domain,
  };
}
