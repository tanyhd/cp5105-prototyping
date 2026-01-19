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
  armed: boolean; // when false, ignore scans
};

export default function QrScanner({ onScan, armed }: Props) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const armedRef = useRef(armed);
  useEffect(() => {
    armedRef.current = armed;
  }, [armed]);

  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const readerId = "reader";

  useEffect(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      readerId,
      { fps: 10, qrbox: 250 },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        if (!armedRef.current) return;

        const parsed = parseScan(decodedText);
        if (!parsed) return;

        // disarm immediately to prevent double logs while camera still sees same QR
        armedRef.current = false;

        onScanRef.current(parsed);
      },
      () => {
        // ignore errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

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
