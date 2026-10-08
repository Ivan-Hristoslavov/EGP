import {
  getStaffBookingNotificationTarget,
  type StaffBookingNotificationInput,
} from "@/lib/booking-staff-notification";
import { sendEmail } from "@/lib/sendgrid-smtp";

/**
 * A client paid but the time was taken in the meantime. The booking is kept
 * (pending) and staff must contact the client to reschedule or refund.
 */
export async function sendBookingConflictAlert(
  booking: StaffBookingNotificationInput,
  conflictMessage: string,
): Promise<void> {
  const target = await getStaffBookingNotificationTarget(booking);

  if (!target) return;

  const text = [
    "ACTION NEEDED: a client paid for a time that was taken at the same moment.",
    "",
    `Client: ${booking.customer_name}`,
    `Email: ${booking.customer_email || "n/a"}`,
    `Phone: ${booking.customer_phone || "n/a"}`,
    `Service: ${booking.service}`,
    `Requested: ${booking.date} at ${booking.time}`,
    `Practitioner: ${target.assignedPractitionerLabel || "n/a"}`,
    "",
    `Conflict: ${conflictMessage}`,
    "",
    "The booking is saved as PENDING with a CONFLICT note. Please contact the",
    "client to choose another time, or refund the payment in Stripe.",
  ].join("\n");

  await sendEmail({
    to: target.to,
    subject: `ACTION NEEDED — paid booking conflict: ${booking.customer_name}`,
    text,
    html: text.replace(/\n/g, "<br>"),
  });
}
