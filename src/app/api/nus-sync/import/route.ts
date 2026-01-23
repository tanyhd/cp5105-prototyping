import { NextResponse } from "next/server";
import { saveNusSyncData } from "@/src/services/mongodb";

export async function POST(req: Request) {
  const { rows } = await req.json();
  const result = await saveNusSyncData(rows);

  return NextResponse.json({ ok: true, ...result });
}
