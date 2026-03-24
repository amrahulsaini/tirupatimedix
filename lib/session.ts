import "server-only";

import { cookies } from "next/headers";

import { dbQuery } from "@/lib/db";
import { generateSessionToken } from "@/lib/security";

export const SESSION_COOKIE_NAME = "tm_session";

export async function getOrCreateSessionToken() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (existing) {
    return { token: existing, shouldSetCookie: false };
  }

  const token = generateSessionToken();
  return { token, shouldSetCookie: true };
}

export async function attachSessionToUser(sessionToken: string, userId: number, email: string) {
  await dbQuery(
    `INSERT INTO user_sessions (session_token, user_id, email, expires_at)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), email = VALUES(email), expires_at = VALUES(expires_at), last_seen_at = NOW()`,
    [sessionToken, userId, email]
  );

  await dbQuery(
    `UPDATE carts SET user_id = ?, email = ? WHERE session_token = ?`,
    [userId, email, sessionToken]
  );
}

export async function getSessionUser(sessionToken: string) {
  const [rows] = await dbQuery<Array<{ user_id: number | null; email: string | null; expires_at: Date }>>(
    `SELECT user_id, email, expires_at
     FROM user_sessions
     WHERE session_token = ?
     LIMIT 1`,
    [sessionToken]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    userId: row.user_id,
    email: row.email,
    expiresAt: row.expires_at,
  };
}
