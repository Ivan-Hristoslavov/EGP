import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

    if (!adminAuth || adminAuth.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
