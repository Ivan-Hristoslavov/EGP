"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "hsl(220 35% 58% / 0.85)",
  "hsl(160 32% 45% / 0.85)",
  "hsl(35 55% 52% / 0.85)",
  "hsl(280 28% 58% / 0.75)",
  "hsl(200 40% 48% / 0.8)",
  "hsl(25 55% 52% / 0.8)",
  "hsl(142 36% 42% / 0.8)",
  "hsl(310 28% 55% / 0.75)",
];

export function DashboardServiceDistributionChart(props: {
  data: { name: string; count: number }[];
}) {
  const hasData = props.data.some((d) => d.count > 0);

  return (
    <Card className="flex h-full w-full flex-col border border-divider shadow-sm">
      <CardHeader className="flex flex-col gap-1 border-b border-divider px-4 py-4 sm:px-6">
        <h2 className="text-base font-semibold leading-tight sm:text-lg">Services</h2>
        <p className="text-xs leading-relaxed text-default-500">
          Last 30 days by booking count
        </p>
      </CardHeader>
      <CardBody className="flex flex-1 flex-col px-2 pb-4 pt-2 sm:px-4">
        {!hasData ? (
          <p className="py-10 text-center text-sm text-default-400">
            Not enough bookings to chart yet
          </p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-[180px] w-full max-w-[200px]">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={props.data}
                    dataKey="count"
                    innerRadius={52}
                    nameKey="name"
                    outerRadius={78}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {props.data.map((_, i) => (
                      <Cell
                        key={String(i)}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid hsl(var(--heroui-divider) / 0.5)",
                      fontSize: 12,
                      background: "hsl(var(--heroui-content1) / 0.96)",
                    }}
                    formatter={(value: number, _n, item) => [
                      `${value} booking${value === 1 ? "" : "s"}`,
                      String(item.payload.name),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex w-full max-w-xs flex-col gap-1.5 text-xs text-default-600 sm:text-[13px]">
              {props.data.map((row, i) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between gap-3 rounded-lg bg-default-100/40 px-2 py-1.5 dark:bg-default-50/10"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="truncate font-medium">{row.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-default-500">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
