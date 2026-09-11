import { db } from "./db/index";
import { sessions } from "./db/schema";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = {
    id: sessionId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 giorni
  };
  await db.insert(sessions).values({
    id: session.id,
    expiresAt: session.expiresAt,
  });
  return session;
}

export async function validateSession(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  const session = result[0] ?? null;

  if (session === null) {
    return { session: null };
  }

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return { session: null };
  }

  // Estende la sessione se è a meno di 15 giorni dalla scadenza
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessions)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessions.id, session.id));
  }

  return { session };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
