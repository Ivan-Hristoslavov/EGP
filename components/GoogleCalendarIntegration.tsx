"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast, ToastMessages } from "@/components/Toast";

type GoogleCalendarConnection = {
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  calendarId?: string;
  userEmail?: string;
  lastSync?: string;
};

export function GoogleCalendarIntegration() {
  const [connection, setConnection] = useState<GoogleCalendarConnection>({
    isConnected: false,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "googleCalendarConnection")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading Google Calendar connection:", error);
        return;
      }

      if (data?.value) {
        setConnection(JSON.parse(data.value));
      }
    } catch (error) {
      console.error("Error loading connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConnection = async (connectionData: GoogleCalendarConnection) => {
    try {
      const { error } = await supabase.from("admin_settings").upsert(
        {
          key: "googleCalendarConnection",
          value: JSON.stringify(connectionData),
        },
        {
          onConflict: "key",
        }
      );

      if (error) {
        throw error;
      }

      setConnection(connectionData);
    } catch (error) {
      console.error("Error saving connection:", error);
      throw error;
    }
  };

  const connectToGoogle = async () => {
    try {
      setConnecting(true);
      
      // Google OAuth 2.0 configuration
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/auth/callback/google`;
      const scope = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email";
      
      if (!clientId) {
        showError("Configuration Error", "Google Client ID is not configured. Please contact support.");
        return;
      }

      // Build OAuth URL
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", scope);
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
      authUrl.searchParams.set("state", "calendar_integration");

      // Open OAuth flow
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Error connecting to Google:", error);
      showError("Connection Error", "Failed to connect to Google Calendar. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const disconnectFromGoogle = async () => {
    try {
      setLoading(true);
      
      // Revoke Google access
      if (connection.accessToken) {
        try {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.accessToken}`, {
            method: "POST",
          });
        } catch (error) {
          console.warn("Error revoking Google token:", error);
        }
      }

      // Clear connection data
      await saveConnection({ isConnected: false });
      
      showSuccess("Disconnected", "Google Calendar has been disconnected successfully.");
    } catch (error) {
      console.error("Error disconnecting:", error);
      showError("Disconnection Error", "Failed to disconnect from Google Calendar.");
    } finally {
      setLoading(false);
    }
  };

  const syncBookings = async () => {
    try {
      setSyncing(true);
      
      const response = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to sync bookings");
      }

      const result = await response.json();
      
      // Update last sync time
      await saveConnection({
        ...connection,
        lastSync: new Date().toISOString(),
      });

      showSuccess("Sync Complete", `Successfully synced ${result.synced || 0} bookings to Google Calendar.`);
    } catch (error) {
      console.error("Error syncing bookings:", error);
      showError("Sync Error", "Failed to sync bookings to Google Calendar.");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Google Calendar Connection Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google Calendar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sync your bookings with Google Calendar
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            connection.isConnected
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}>
            {connection.isConnected ? "Connected" : "Not Connected"}
          </div>
        </div>

        {connection.isConnected ? (
          <div className="space-y-4">
            {/* Connection Info */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Successfully connected to Google Calendar
                </span>
              </div>
              {connection.userEmail && (
                <p className="text-sm text-green-700 dark:text-green-300">
                  Connected as: {connection.userEmail}
                </p>
              )}
              {connection.lastSync && (
                <p className="text-sm text-green-700 dark:text-green-300">
                  Last sync: {new Date(connection.lastSync).toLocaleString()}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={syncBookings}
                disabled={syncing}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {syncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Bookings
                  </>
                )}
              </button>
              <button
                onClick={disconnectFromGoogle}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connection Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Connect Google Calendar to:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Automatically sync new bookings to your calendar</li>
                <li>• Keep track of appointments across all devices</li>
                <li>• Receive calendar notifications for upcoming jobs</li>
                <li>• Avoid double-booking conflicts</li>
              </ul>
            </div>

            {/* Connect Button */}
            <button
              onClick={connectToGoogle}
              disabled={connecting}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {connecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Connect Google Calendar
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Auto-sync Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sync Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Auto-sync new bookings
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically create calendar events when new bookings are made
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={connection.isConnected}
                disabled={!connection.isConnected}
                onChange={() => {
                  // Handle auto-sync toggle
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 