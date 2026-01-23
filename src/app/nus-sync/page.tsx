"use client";

import Papa from "papaparse";
import { useState } from "react";

type NusSyncRow = {
  user_id?: number;
  net_id?: string;
  member_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  account_type?: string;
  submission_id?: number;
  started_on?: string;
  submitted_on?: string;
  student_tags?: string;
};

function toSnakeCaseHeader(h: string) {
  return h
    .trim()
    .replace(/^\uFEFF/, "") // remove BOM
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_") // spaces/symbols -> _
    .replace(/^_+|_+$/g, "");
}

function toRow(raw: Record<string, any>): NusSyncRow {
  return {
    user_id: raw.user_id ? Number(raw.user_id): undefined,
    net_id: String(raw.net_id ?? ""),
    member_id: String(raw.member_id ?? ""),
    first_name: String(raw.first_name ?? ""),
    last_name: String(raw.last_name ?? ""),
    email: String(raw.email ?? ""),
    gender: String(raw.gender ?? ""),
    account_type: String(raw.account_type ?? ""),
    submission_id: Number(raw.submission_id),
    started_on: String(raw.started_on ?? ""),
    submitted_on: String(raw.submitted_on ?? ""),
    student_tags: String(raw.student_tags ?? ""),
  };
}

export default function NusSyncPage() {
  const [rows, setRows] = useState<NusSyncRow[]>([]);
  const [msg, setMsg] = useState<string>("");

  const onPickFile = async (file: File) => {
    setMsg("");
    setRows([]);

    const text = await file.text();
    const parsed = Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: toSnakeCaseHeader, // "User Id" -> "user_id"
    });

    if (parsed.errors?.length) {
      setMsg(parsed.errors[0].message);
      return;
    }

    const mapped = (parsed.data || [])
      .map(toRow)
      .filter((r) => Number.isFinite(r.submission_id)); // minimal sanity check

    setRows(mapped);
    setMsg(`Parsed ${mapped.length} rows`);
  };

  const importToDb = async () => {
    setMsg("Importing...");
    const res = await fetch("/api/nus-sync/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data?.error || "Import failed");
      return;
    }
    setMsg(`Imported ${data.upsertedCount} rows (upsert)`);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Load CSV (NUSSync Data)</h1>

      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPickFile(f);
        }}
      />

      <div style={{ marginTop: 12 }}>
        <button disabled={rows.length === 0} onClick={importToDb}>
          Save to Database
        </button>
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      {rows.length > 0 && (
        <pre style={{ marginTop: 12, padding: 12, border: "1px solid #ddd" }}>
          {JSON.stringify(rows.slice(0, 5), null, 2)}
        </pre>
      )}
    </div>
  );
}
