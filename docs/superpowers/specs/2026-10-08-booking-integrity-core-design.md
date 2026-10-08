# Booking integrity core — design

Status: approved by the owner (2026-10-08). Scope: part **A** only.
Out of scope: part B (admin calendar UI), part C (slot hold during checkout, automatic refunds, DB-level exclusion constraint).

## Problem

Two practitioners (separate rooms, same clinic hours) take bookings. Today:

| Path | Overlap check |
|---|---|
| Paid online booking (`/api/stripe/confirm-payment`) | none — only a stale availability snapshot shown to the client |
| Free consultation + admin-created booking (`POST /api/bookings`) | exact same start time, clinic-wide (ignores practitioner and duration) |
| Public availability (`/api/bookings/availability/team[/range]`) | per practitioner, duration + buffer — but ignores bookings that have no practitioner |
| Admin move/edit | exact start time only |

Result: double booking after payment is possible, admin-created bookings do not block online slots, and free consultations are blocked across practitioners although rooms are separate.

## Decisions (from the owner)

- Same working hours for both practitioners; **availability is independent per practitioner** (separate rooms).
- Daily limit (`max_appointments`) is counted **per practitioner**.
- Every admin-created booking **must** have a practitioner. Existing bookings without one stay valid but occupy time for **everyone** until assigned.
- Strict: the admin cannot bypass the overlap check.

## Rules (single source of truth)

1. A booking occupies `[start, start + duration + buffer)` for its practitioner (buffer = clinic buffer, default 15 min; duration default 30 min when unknown).
2. Bookings of different practitioners never conflict.
3. Statuses that occupy time: `pending`, `confirmed`, `scheduled`. `cancelled` and `completed` do not.
4. A booking with no practitioner occupies the time of every practitioner.
5. The daily limit counts a practitioner's bookings plus unassigned bookings of that day.
6. Online booking never offers a start time that is already in the past (today).
7. No override: a conflicting admin write is rejected with a clear message.

## Components

- `lib/booking-availability.ts` — pure functions, no I/O: time helpers, `occupiedRange`, `findOverlap`, `isWithinDayLimit`, `buildDaySlots` (available/booked 15-min start times for one practitioner on one day).
- `lib/booking-conflicts.ts` — server wrapper: loads the day's bookings, resolves buffer and limit from clinic hours, exposes `assertSlotFree({ date, time, durationMinutes, teamMemberId, excludeBookingId })` returning `{ ok: true }` or `{ ok: false, conflict }`.

Used by every write path and by the public list so list and write can never disagree:

| Path | Change |
|---|---|
| `GET /api/bookings/availability/team` and `/range` | inline slot loops replaced by `buildDaySlots`, unassigned bookings now block |
| `POST /api/bookings` | `assertSlotFree` per practitioner (replaces same-start-time + clinic-wide day count) |
| `PUT/PATCH /api/bookings/[id]`, `POST /api/bookings/[id]/move` | `assertSlotFree` with `excludeBookingId` when date/time/practitioner change |
| `POST /api/stripe/create-payment-intent` | pre-check before any payment is started (`409 SLOT_TAKEN`) |
| `POST /api/stripe/confirm-payment` | idempotent per PaymentIntent; final check; on conflict after payment the booking is kept as `pending` with a `CONFLICT – reschedule` note and staff are emailed (no automatic refund in this part) |

## Messages

- Admin: `Maria is booked 14:00–15:00 (client name). Choose another time.`
- Client: `Sorry, this time was just taken. Please choose another.` and the booking flow returns to the time step with a refreshed list.

## Testing

- Unit tests per rule 1–6, edge cases (back-to-back bookings, buffer, closing time, unassigned bookings, daily limit).
- Characterization test: `buildDaySlots` returns the same slots as the current inline range-route logic for the same fixtures when no unassigned bookings exist.
- Route tests with a mocked Supabase client for each write path.

## Rollout and residual risk

- Local only until the owner reviews; no database change in this part.
- Residual: two requests in the same millisecond can both pass the application-level check. A database exclusion constraint closes this in part C once data is clean.
