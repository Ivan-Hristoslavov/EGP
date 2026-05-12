import { supabaseAdmin } from "@/lib/supabase";

/** Matches `working_hours.day_of_week` and public availability (0 = Sunday … 6 = Saturday). */
export type ClinicUtcDayHours = {
  start_time: string;
  end_time: string;
  is_working_day: boolean;
  buffer_minutes: number;
  max_appointments: number;
};

export type ResolveClinicUtcDayResult =
  | { status: "open"; hours: ClinicUtcDayHours }
  | { status: "closed"; message: string };

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/**
 * Resolves clinic open hours for a UTC weekday (same convention as /book availability).
 * Tries `admin_settings.business_hours` first, then `working_hours`.
 */
export async function resolveClinicWorkingHoursForUtcDay(
  utcDayOfWeek: number,
): Promise<ResolveClinicUtcDayResult> {
  if (utcDayOfWeek < 0 || utcDayOfWeek > 6) {
    return { status: "closed", message: "Invalid day of week" };
  }

  const currentDayKey = DAY_KEYS[utcDayOfWeek];

  const { data: adminSettingsData, error: adminSettingsError } =
    await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", "business_hours")
      .single();

  let startTime: string | null = null;
  let endTime: string | null = null;
  let bufferMinutes = 15;
  let maxAppointments = 12;

  if (!adminSettingsError && adminSettingsData?.value) {
    const businessHours =
      typeof adminSettingsData.value === "string"
        ? JSON.parse(adminSettingsData.value as string)
        : adminSettingsData.value;

    const dayHours = businessHours[currentDayKey] as
      | {
          isOpen?: boolean;
          open?: string;
          close?: string;
          bufferMinutes?: number;
          maxAppointments?: number;
        }
      | undefined;

    if (dayHours) {
      if (dayHours.isOpen === false) {
        return { status: "closed", message: "This day is not a working day" };
      }

      startTime = dayHours.open ?? null;
      endTime = dayHours.close ?? null;
      bufferMinutes = dayHours.bufferMinutes ?? 15;
      maxAppointments = dayHours.maxAppointments ?? 12;

      if (!startTime || !endTime) {
        return {
          status: "closed",
          message: "This day has no working hours configured",
        };
      }

      return {
        status: "open",
        hours: {
          start_time: startTime,
          end_time: endTime,
          is_working_day: true,
          buffer_minutes: bufferMinutes,
          max_appointments: maxAppointments,
        },
      };
    }

    return { status: "closed", message: "This day is not a working day" };
  }

  const { data: whData, error: whError } = await supabaseAdmin
    .from("working_hours")
    .select("*")
    .eq("day_of_week", utcDayOfWeek)
    .single();

  if (!whError && whData) {
    if (whData.is_working_day === false) {
      return { status: "closed", message: "This day is not a working day" };
    }

    return {
      status: "open",
      hours: {
        start_time: whData.start_time,
        end_time: whData.end_time,
        is_working_day: true,
        buffer_minutes: whData.buffer_minutes ?? 15,
        max_appointments: whData.max_appointments ?? 12,
      },
    };
  }

  return {
    status: "closed",
    message: "This day is not a working day",
  };
}
