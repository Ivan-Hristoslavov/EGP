import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Only allow this in development or with a secret key
  const authHeader = request.headers.get('authorization');
  const isAuthorized = process.env.NODE_ENV === 'development' || 
                      authHeader === `Bearer ${process.env.DEBUG_SECRET_KEY}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    timestamp: new Date().toISOString()
  });
} 