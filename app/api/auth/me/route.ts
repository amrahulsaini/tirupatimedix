import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ensureDatabaseSchema } from "@/lib/db";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET() {
  await ensureDatabaseSchema();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return NextResponse.json({ ok: true, authenticated: false });
  }

  const session = await getSessionUser(sessionToken);
  if (!session?.email) {
    return NextResponse.json({ ok: true, authenticated: false });
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: {
      email: session.email,
      userId: session.userId,
    },
  });
}
