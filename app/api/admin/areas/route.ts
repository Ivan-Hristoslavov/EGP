import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";

// admin_areas_cover table does not exist - return empty/safe responses
// useAreas hook returns [] - this API is kept for compatibility

// GET: List all areas (returns [] since table doesn't exist)
export async function GET() {
  const denied = await requireAdmin();

  if (denied) return denied;

  return NextResponse.json([]);
}

// POST: No-op (table doesn't exist)
export async function POST() {
  const denied = await requireAdmin();

  if (denied) return denied;

  return NextResponse.json(
    { error: "Areas feature not configured" },
    { status: 503 },
  );
}

// PUT: No-op (table doesn't exist)
export async function PUT() {
  const denied = await requireAdmin();

  if (denied) return denied;

  return NextResponse.json(
    { error: "Areas feature not configured" },
    { status: 503 },
  );
}

// DELETE: No-op (table doesn't exist)
export async function DELETE() {
  const denied = await requireAdmin();

  if (denied) return denied;

  return NextResponse.json(
    { error: "Areas feature not configured" },
    { status: 503 },
  );
}
