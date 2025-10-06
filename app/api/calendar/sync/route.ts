import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type GoogleCalendarConnection = {
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  calendarId?: string;
  userEmail?: string;
  lastSync?: string;
};

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  description: string;
  booking_date: string;
  booking_time: string;
  status: string;
  created_at: string;
  updated_at: string;
};

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Google OAuth credentials");
      return null;
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh token");
      return null;
    }

    const tokens = await response.json();
    return tokens.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  booking: Booking
) {
  try {
    // Parse booking date and time
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const endDateTime = new Date(bookingDateTime.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

    const event = {
      summary: `${booking.service_type} - ${booking.customer_name}`,
      description: `
Service: ${booking.service_type}
Customer: ${booking.customer_name}
Phone: ${booking.customer_phone}
Email: ${booking.customer_email}
Description: ${booking.description}
Status: ${booking.status}

Booking ID: ${booking.id}
      `.trim(),
      start: {
        dateTime: bookingDateTime.toISOString(),
        timeZone: "Europe/London",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Europe/London",
      },
      attendees: [
        {
          email: booking.customer_email,
          displayName: booking.customer_name,
        },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 hours before
          { method: "popup", minutes: 30 }, // 30 minutes before
        ],
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Failed to create calendar event:", errorData);
      return null;
    }

    const createdEvent = await response.json();
    return createdEvent.id;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get Google Calendar connection
    const { data: connectionData, error: connectionError } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "googleCalendarConnection")
      .single();

    if (connectionError || !connectionData?.value) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    const connection: GoogleCalendarConnection = JSON.parse(connectionData.value);

    if (!connection.isConnected || !connection.accessToken) {
      return NextResponse.json(
        { error: "Google Calendar not properly connected" },
        { status: 400 }
      );
    }

    // Get bookings that haven't been synced yet
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .is("google_calendar_event_id", null) // Only bookings not yet synced
      .eq("status", "confirmed") // Only confirmed bookings
      .order("booking_date", { ascending: true });

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ message: "No new bookings to sync", synced: 0 });
    }

    let accessToken = connection.accessToken;
    let syncedCount = 0;

    // Try to sync each booking
    for (const booking of bookings) {
      try {
        let eventId = await createCalendarEvent(
          accessToken,
          connection.calendarId || "primary",
          booking
        );

        // If failed due to expired token, try refreshing
        if (!eventId && connection.refreshToken) {
          const newAccessToken = await refreshAccessToken(connection.refreshToken);
          if (newAccessToken) {
            accessToken = newAccessToken;
            
            // Update connection with new access token
            const updatedConnection = {
              ...connection,
              accessToken: newAccessToken,
            };
            
            await supabase.from("admin_settings").upsert(
              {
                key: "googleCalendarConnection",
                value: JSON.stringify(updatedConnection),
              },
              {
                onConflict: "key",
              }
            );

            // Retry creating the event
            eventId = await createCalendarEvent(
              newAccessToken,
              connection.calendarId || "primary",
              booking
            );
          }
        }

        if (eventId) {
          // Update booking with Google Calendar event ID
          await supabase
            .from("bookings")
            .update({ google_calendar_event_id: eventId })
            .eq("id", booking.id);
          
          syncedCount++;
        }
      } catch (error) {
        console.error(`Error syncing booking ${booking.id}:`, error);
        // Continue with next booking
      }
    }

    // Update last sync time
    const updatedConnection = {
      ...connection,
      accessToken,
      lastSync: new Date().toISOString(),
    };
    
    await supabase.from("admin_settings").upsert(
      {
        key: "googleCalendarConnection",
        value: JSON.stringify(updatedConnection),
      },
      {
        onConflict: "key",
      }
    );

    return NextResponse.json({
      message: `Successfully synced ${syncedCount} bookings`,
      synced: syncedCount,
      total: bookings.length,
    });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync calendar" },
      { status: 500 }
    );
  }
} 