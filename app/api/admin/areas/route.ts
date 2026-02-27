import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// admin_areas_cover table does not exist - return empty/safe responses
// useAreas hook returns [] - this API is kept for compatibility

// GET: List all areas (returns [] since table doesn't exist)
export async function GET() {
  return NextResponse.json([]);
}

// POST: No-op (table doesn't exist)
export async function POST() {
  return NextResponse.json({ error: 'Areas feature not configured' }, { status: 503 });
}

// PUT: No-op (table doesn't exist)
export async function PUT() {
  return NextResponse.json({ error: 'Areas feature not configured' }, { status: 503 });
}

// DELETE: No-op (table doesn't exist)
export async function DELETE() {
  return NextResponse.json({ error: 'Areas feature not configured' }, { status: 503 });
} 