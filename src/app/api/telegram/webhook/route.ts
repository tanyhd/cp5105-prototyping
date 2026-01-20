import { NextRequest, NextResponse } from "next/server";
import { tgSendMessage } from "@/src/common/Telegram";
import {
  upsertStartRegistration, // chatId + eventId -> awaiting
  findAwaitingByChat, // latest awaiting for this chatId
  completeRegistration, // set studentId + registered
} from "@/src/services/mongodb";

export const runtime = "nodejs";

function parseStartPayload(text: string) {
  const m = text.match(/^\/start(?:\s+(\S+))?/);
  return m?.[1] ?? null;
}

function isValidStudentId(s: string) {
  return /^E\d+$/i.test(s.trim());
}

export async function POST(req: NextRequest) {
  const update = await req.json();
  const msg = update?.message;
  const text: string | undefined = msg?.text;
  const chatId: number | undefined = msg?.chat?.id;

  if (!text || !chatId) return NextResponse.json({ ok: true });

  // /start <eventId>
  if (text.startsWith("/start")) {
    const eventId = parseStartPayload(text) ?? "default_event"; // or reject if missing
    await upsertStartRegistration(chatId, eventId);

    await tgSendMessage(
      chatId,
      `Welcome! Please reply with your NUS student id to register for: ${eventId} (e.g. E1234567).`
    );

    return NextResponse.json({ ok: true });
  }

  // If there's an awaiting registration for this chat, treat message as studentId
  const awaiting = await findAwaitingByChat(chatId);

  if (awaiting) {
    const studentId = text.trim();
    if (!isValidStudentId(studentId)) {
      await tgSendMessage(
        chatId,
        "Invalid student id format. Example: E1234567. Please try again."
      );
      return NextResponse.json({ ok: true });
    }

    await completeRegistration(awaiting.chatId, awaiting.eventId, studentId);

    await tgSendMessage(
      chatId,
      `Registered ✅ Student ID: ${studentId} for ${awaiting.eventId}`
    );
    return NextResponse.json({ ok: true });
  }
}
