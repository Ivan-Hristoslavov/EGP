export type DailyBookingPoint = {
  date: string;
  bookings: number;
  cancellations: number;
};

export type ServiceSlice = {
  name: string;
  count: number;
};

function padDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Last `numDays` days ending on `end` (inclusive), each ISO date key. */
export function buildDailyBookingSeries(
  rows: { date: string; status: string | null }[],
  end: Date,
  numDays: number,
): DailyBookingPoint[] {
  const byDay = new Map<string, { bookings: number; cancellations: number }>();

  for (const r of rows) {
    const key =
      typeof r.date === "string"
        ? r.date.split("T")[0]
        : padDateKey(new Date(r.date));

    if (!byDay.has(key))
      byDay.set(key, {
        bookings: 0,
        cancellations: 0,
      });
    const cell = byDay.get(key)!;

    cell.bookings += 1;
    if (r.status === "cancelled") cell.cancellations += 1;
  }

  const out: DailyBookingPoint[] = [];

  for (let i = numDays - 1; i >= 0; i -= 1) {
    const d = new Date(end);

    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = padDateKey(d);
    const cell = byDay.get(key);

    out.push({
      date: key,
      bookings: cell?.bookings ?? 0,
      cancellations: cell?.cancellations ?? 0,
    });
  }

  return out;
}

export function aggregateServices(
  rows: { service: string | null }[],
  limit = 8,
): ServiceSlice[] {
  const counts = new Map<string, number>();

  for (const r of rows) {
    const name = (r.service || "Other").trim() || "Other";

    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((s, [, n]) => s + n, 0);
  const slices: ServiceSlice[] = top.map(([name, count]) => ({ name, count }));

  if (rest > 0) slices.push({ name: "Other", count: rest });

  return slices;
}
