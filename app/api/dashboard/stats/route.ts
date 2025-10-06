import { NextResponse } from "next/server";

import { supabase } from "../../../../lib/supabase";

// Helper function to map activity types to status values
function getActivityStatus(activityType: string): string {
  switch (activityType) {
    case 'booking_created':
      return 'success';
    case 'booking_updated':
      return 'warning';
    case 'payment_received':
      return 'success';
    case 'invoice_sent':
      return 'info';
    case 'customer_added':
      return 'success';
    default:
      return 'info';
  }
}

// GET - Fetch dashboard statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const getAllActivity = searchParams.get('allActivity') === 'true';

    // Get stats from the view
    const { data: stats, error: statsError } = await supabase
      .from("dashboard_stats")
      .select("*")
      .single();

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 400 });
    }

    // Get activity - either recent or all based on parameter
    const activityQuery = supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false });

    if (!getAllActivity) {
      activityQuery.limit(10);
    }

    const { data: activity, error: activityError } = await activityQuery;

    if (activityError) {
      return NextResponse.json(
        { error: activityError.message },
        { status: 400 },
      );
    }

    // Transform activity data to match frontend expectations
    const transformedActivity = activity?.map((item: any) => ({
      id: item.id,
      type: item.entity_type, // booking, payment, customer, invoice
      message: item.message,
      time: new Date(item.created_at).toLocaleString(),
      status: getActivityStatus(item.activity_type)
    })) || [];

    // Get upcoming bookings from today onwards (including today)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const { data: upcomingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        customer:customers(name, email)
      `,
      )
      .gte("date", today.toISOString().split("T")[0]) // From today onwards
      .in("status", ["pending", "scheduled"]) // Only pending and scheduled bookings
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .limit(10);

    if (bookingsError) {
      return NextResponse.json(
        { error: bookingsError.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      stats,
      recentActivity: getAllActivity ? transformedActivity : transformedActivity,
      allActivity: getAllActivity ? transformedActivity : null,
      upcomingBookings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
