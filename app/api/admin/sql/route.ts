import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

const MAX_QUERY_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body?.query === 'string' ? body.query.trim() : '';

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: 'Query is too long' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc('admin_execute_sql', {
      query_text: query,
    });

    if (error) {
      console.error('SQL execution error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to execute query' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      rows: data ?? [],
      count: Array.isArray(data) ? data.length : 0,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected SQL console error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
