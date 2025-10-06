import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check for OAuth errors
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        new URL("/admin/settings?tab=connections&error=oauth_error", request.url)
      );
    }

    // Validate state parameter
    if (state !== "calendar_integration") {
      console.error("Invalid state parameter");
      return NextResponse.redirect(
        new URL("/admin/settings?tab=connections&error=invalid_state", request.url)
      );
    }

    if (!code) {
      console.error("No authorization code received");
      return NextResponse.redirect(
        new URL("/admin/settings?tab=connections&error=no_code", request.url)
      );
    }

    // Exchange authorization code for access token
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${new URL(request.url).origin}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      console.error("Missing Google OAuth credentials");
      return NextResponse.redirect(
        new URL("/admin/settings?tab=connections&error=config_error", request.url)
      );
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL("/admin/settings?tab=connections&error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      console.error("Failed to get user info");
      return NextResponse.redirect(
        new URL("/admin/settings?tab=connections&error=user_info_failed", request.url)
      );
    }

    const userInfo = await userInfoResponse.json();

    // Get primary calendar ID
    const calendarResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList/primary",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    let calendarId = "primary";
    if (calendarResponse.ok) {
      const calendarData = await calendarResponse.json();
      calendarId = calendarData.id || "primary";
    }

    // Save connection data to database
    const connectionData = {
      isConnected: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      calendarId,
      userEmail: userInfo.email,
      lastSync: new Date().toISOString(),
    };

    const supabase = createClient();
    const { error: saveError } = await supabase.from("admin_settings").upsert(
      {
        key: "googleCalendarConnection",
        value: JSON.stringify(connectionData),
      },
      {
        onConflict: "key",
      }
    );

    if (saveError) {
      console.error("Error saving connection:", saveError);
      return NextResponse.redirect(
        new URL("/admin/settings?tab=connections&error=save_failed", request.url)
      );
    }

    // Redirect back to settings with success
    return NextResponse.redirect(
      new URL("/admin/settings?tab=connections&success=connected", request.url)
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/admin/settings?tab=connections&error=unknown", request.url)
    );
  }
} 