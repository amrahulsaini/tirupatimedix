import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { dbQuery, ensureDatabaseSchema } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST() {
  await ensureDatabaseSchema();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await dbQuery(`DELETE FROM user_sessions WHERE session_token = ?`, [sessionToken]);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
