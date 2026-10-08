# Admin calendar with practitioners — design (part B)

Status: scope approved by the owner ("make the calendar"). Builds on part A (`2026-10-08-booking-integrity-core-design.md`).
Out of scope: slot hold, automatic refunds, database exclusion constraint (part C).

## Goal

The two practitioners work in separate rooms with shared clinic hours. The admin calendar must show, create and move bookings **per practitioner**, make free time obvious, and make overlaps impossible to create by accident. Everything that exists today (month / week / day views, drag-to-move, stats, working hours panel) stays.

## Behaviour

1. **Practitioner filter** above the calendar: `All`, one chip per active practitioner (colour dot + count for the visible period), `Unassigned (n)` only when n > 0. Remembered in the browser. Applies to month, week, day, stats.
2. **Colour per practitioner** (stable: by name order) on every booking pill, with initials; unassigned bookings use a dashed neutral style.
3. **Day view = timeline in columns**: one column per practitioner (plus an `Unassigned` column when needed), hour grid, bookings positioned by start and duration, overlapping legacy bookings shown side by side, "now" line today, a column greyed out with "Day off" when the practitioner is off. Clicking an empty half-hour opens *New booking* with date, practitioner and time prefilled. A `Timeline | List` toggle keeps the old list available.
4. **Forms**: New booking and Edit get a required **Practitioner** select; the time list shows only free times for that practitioner (`/api/admin/time-slots?team_member_id=`). Move uses the booking's own practitioner.
5. **Unassigned bookings**: badge + inline "Assign" select (PATCH `team_member_id`, which goes through the part A overlap check); also in the details modal.
6. **Server**: `POST /api/bookings` rejects an admin request without a practitioner (`400`); `PUT /api/bookings?id=` accepts `team_member_id` and `service_duration_minutes` and re-checks overlaps with them. Public flows without a practitioner are unchanged.
7. Two existing bugs are fixed on the way: after creating or editing a booking the calendar stored the API wrapper object instead of the booking, so the booking vanished until a reload.

## Components

- `lib/calendar-practitioners.ts` — pure helpers: colours/badges, filter, counts, day-off check, column layout, day window.
- `app/admin/calendar/use-calendar-team.ts` — loads active practitioners from `/api/team`.
- `components/admin/calendar/practitioner-filter.tsx` — filter chips.
- `components/admin/calendar/calendar-day-columns.tsx` — timeline columns.
- Changes in `booking-event-pill.tsx`, `calendar-month-grid.tsx`, `calendar-week-grid.tsx`, `calendar-day-panel.tsx`, `calendar-types.ts`, `app/admin/calendar/page.tsx`, `app/admin/bookings/page.tsx`, `app/api/bookings/route.ts`.

## Accessibility

Filter is a labelled group of toggle buttons (`aria-pressed`); columns are labelled regions; cards are buttons with full accessible names; empty slots are buttons with a label ("New booking for Maria at 14:00"); colour is never the only signal (initials and names are always present); touch targets ≥ 44px.

## Testing

Unit tests for every pure helper; route tests for the server rules; typecheck; visual check of the day view with mock data in the browser pane (no writes to the live database).
