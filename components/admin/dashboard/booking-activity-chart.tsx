"use client";

import { Card, CardBody, CardHeader, Tab, Tabs } from "@heroui/react";
import type { DailyBookingPoint } from "@/lib/dashboard-analytics";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const grid = { stroke: "hsl(var(--heroui-default-200) / 0.25)" };

function shortLabel(iso: string) {
  const [, m, d] = iso.split("-");

  return `${m}/${d}`;
}

function ChartInner({ data }: { data: DailyBookingPoint[] }) {
  return (
    <ResponsiveContainer height={280} width="100%">
      <AreaChart
        data={data}
        margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
      >
        <defs>
          <linearGradient id="dashFillBook" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(142 45% 42% / 0.22)" />
            <stop offset="100%" stopColor="hsl(142 45% 42% / 0)" />
          </linearGradient>
          <linearGradient id="dashFillCan" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(340 55% 52% / 0.12)" />
            <stop offset="100%" stopColor="hsl(340 55% 52% / 0)" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" vertical={false} {...grid} />
        <XAxis
          axisLine={false}
          dataKey="date"
          interval="preserveStartEnd"
          tick={{ fill: "hsl(var(--heroui-default-500))", fontSize: 10 }}
          tickFormatter={shortLabel}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid hsl(var(--heroui-divider) / 0.5)",
            fontSize: 12,
            background: "hsl(var(--heroui-content1) / 0.95)",
          }}
          formatter={(value: number, name: string) => [
            value,
            name === "bookings" ? "Bookings" : "Cancellations",
          ]}
          labelFormatter={(label) => label}
        />
        <Area
          dataKey="cancellations"
          fill="url(#dashFillCan)"
          name="cancellations"
          stroke="hsl(340 45% 55% / 0.55)"
          strokeWidth={1.25}
          type="monotone"
        />
        <Area
          dataKey="bookings"
          fill="url(#dashFillBook)"
          name="bookings"
          stroke="hsl(142 40% 38% / 0.65)"
          strokeWidth={1.5}
          type="monotone"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DashboardBookingActivityChart(props: {
  series7: DailyBookingPoint[];
  series30: DailyBookingPoint[];
}) {
  return (
    <Card className="flex h-full w-full flex-col border border-divider shadow-sm">
      <CardHeader className="flex flex-col gap-1 border-b border-divider px-4 py-4 sm:px-6">
        <h2 className="text-base font-semibold sm:text-lg">Booking activity</h2>
        <p className="text-xs text-default-500">
          Daily volume and cancellations (clinic dates)
        </p>
      </CardHeader>
      <CardBody className="flex flex-1 flex-col gap-4 px-3 pb-4 pt-2 sm:px-6">
        <Tabs classNames={{ panel: "pt-2" }} size="sm" variant="underlined">
          <Tab key="7d" title="7 days">
            <ChartInner data={props.series7} />
          </Tab>
          <Tab key="30d" title="30 days">
            <ChartInner data={props.series30} />
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
}
