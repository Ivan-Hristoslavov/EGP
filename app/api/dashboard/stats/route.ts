import { NextResponse } from "next/server";

import { supabase, supabaseAdmin } from "../../../../lib/supabase";

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

    // Calculate stats directly from tables
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    
    // Get start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split("T")[0];
    const startOfMonthISO = startOfMonth.toISOString();
    
    // Use admin client to bypass RLS
    // 1. Today's Bookings count
    const { count: todayBookingsCount, error: todayBookingsError } = await supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("date", todayStr);

    // 2. Monthly Revenue (sum of paid payments this month)
    // Filter directly in database for better performance
    const { data: monthlyPayments, error: monthlyPaymentsError } = await supabaseAdmin
      .from("payments")
      .select("amount")
      .eq("payment_status", "paid")
      .gte("created_at", startOfMonthISO)
      .lte("created_at", today.toISOString());
    
    // Sum amounts (amount is DECIMAL, so it comes as string from Supabase)
    const monthlyRevenue = monthlyPayments?.reduce((sum: number, p: any) => {
      const amount = typeof p.amount === 'string' ? parseFloat(p.amount) : (p.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0) || 0;
    
    if (monthlyPaymentsError) {
      console.error("Error fetching monthly payments:", monthlyPaymentsError);
    }
    
    console.log(`Monthly revenue calculated: £${monthlyRevenue.toFixed(2)} from ${monthlyPayments?.length || 0} payments`);


    // 3. Active Clients count (customers with bookings or payments in last 90 days)
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];

    const { data: activeCustomers, error: activeCustomersError } = await supabaseAdmin
      .from("customers")
      .select("id", { count: "exact", head: false })
      .eq("is_active", true);

    // Also count customers from bookings/payments
    const { data: customersFromBookings } = await supabaseAdmin
      .from("bookings")
      .select("customer_id")
      .not("customer_id", "is", null)
      .gte("date", ninetyDaysAgoStr);

    const { data: customersFromPayments } = await supabaseAdmin
      .from("payments")
      .select("customer_id, payment_date")
      .not("customer_id", "is", null);
    
    // Filter payments from last 90 days (handle both DATE and TIMESTAMP)
    const recentPayments = customersFromPayments?.filter((p: any) => {
      if (!p.payment_date) return false;
      const dateStr = typeof p.payment_date === 'string' 
        ? p.payment_date.split('T')[0] 
        : new Date(p.payment_date).toISOString().split('T')[0];
      return dateStr >= ninetyDaysAgoStr;
    }) || [];

    const uniqueCustomerIds = new Set<string>();
    activeCustomers?.forEach(c => c.id && uniqueCustomerIds.add(c.id));
    customersFromBookings?.forEach(b => b.customer_id && uniqueCustomerIds.add(b.customer_id));
    recentPayments.forEach(p => p.customer_id && uniqueCustomerIds.add(p.customer_id));
    const activeClientsCount = uniqueCustomerIds.size;

    // 4. Average Rating (from approved reviews)
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from("reviews")
      .select("rating")
      .eq("is_approved", true);

    const avgRating = reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

    // Build stats object
    const stats = {
      today_bookings: todayBookingsCount || 0,
      monthly_revenue: monthlyRevenue,
      active_clients: activeClientsCount,
      avg_rating: parseFloat(avgRating),
    };

    // Get activity - either recent or all based on parameter
    const activityQuery = supabaseAdmin
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
    const { data: upcomingBookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        *,
        customers(first_name, last_name, email)
      `,
      )
      .gte("date", todayStr) // From today onwards
      .in("status", ["pending", "scheduled", "confirmed"]) // Only pending, scheduled, and confirmed bookings
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
