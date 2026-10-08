import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * Verify admin authentication from an API route handler.
 * Returns null if authenticated, or a 401 NextResponse if not.
 *
 * Usage:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get("adminAuth");

    if (!adminAuth?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET env var is not set");

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = jwt.verify(adminAuth.value, jwtSecret) as { type: string };

    if (payload.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/**
 * For scheduled jobs: accepts either an admin session or the `CRON_SECRET`
 * (sent as `Authorization: Bearer <secret>`, which Vercel Cron adds automatically
 * when the `CRON_SECRET` environment variable is set).
 */
export async function requireAdminOrCron(
  request: Request,
): Promise<NextResponse | null> {
  const secret = process.env.CRON_SECRET;

  if (secret && request.headers.get("authorization") === `Bearer ${secret}`) {
    return null;
  }

  return requireAdmin();
}
