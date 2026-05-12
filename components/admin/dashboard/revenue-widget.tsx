"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

function formatMom(ratio: number | null) {
  if (ratio === null || Number.isNaN(ratio)) return "—";
  const pct = Math.round(ratio * 1000) / 10;

  if (pct > 0) return `+${pct}%`;
  if (pct < 0) return `${pct}%`;

  return "0%";
}

export function DashboardRevenueWidget(props: {
  monthlyRevenue: number;
  revenueMomRatio: number | null;
  sparkPoints: { label: string; v: number }[];
}) {
  const chip =
    props.revenueMomRatio === null
      ? "default"
      : props.revenueMomRatio >= 0
        ? "success"
        : "danger";

  return (
    <Card className="flex h-full w-full flex-col border border-divider shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b border-divider px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-base font-semibold leading-tight sm:text-lg">
            Revenue
          </h2>
          <p className="text-xs leading-normal text-default-500">
            Paid this calendar month
          </p>
        </div>
        <Chip className="w-fit shrink-0 sm:self-start" color={chip} size="sm" variant="flat">
          MoM {formatMom(props.revenueMomRatio)}
        </Chip>
      </CardHeader>
      <CardBody className="flex flex-1 flex-col gap-3 px-4 pb-5 pt-3 sm:px-6">
        <motion.div
          className="text-3xl font-semibold tracking-tight text-default-800 tabular-nums dark:text-default-100"
          initial={{ opacity: 0.6, y: 4 }}
          key={props.monthlyRevenue}
          transition={{ duration: 0.35, ease: "easeOut" }}
          animate={{ opacity: 1, y: 0 }}
        >
          £{props.monthlyRevenue.toFixed(2)}
        </motion.div>
        <p className="text-xs text-default-500">
          Sparkline: daily booking volume (proxy for momentum)
        </p>
        <div className="h-16 w-full opacity-90">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={props.sparkPoints} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revSpark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(212 55% 48% / 0.25)" />
                  <stop offset="100%" stopColor="hsl(212 55% 48% / 0)" />
                </linearGradient>
              </defs>
              <RechartsTooltip
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 11,
                  border: "1px solid hsl(var(--heroui-divider) / 0.45)",
                }}
                formatter={(v: number) => [`${v}`, "Bookings"]}
                labelFormatter={(l) => l}
              />
              <Area
                dataKey="v"
                fill="url(#revSpark)"
                stroke="hsl(212 50% 45% / 0.55)"
                strokeWidth={1.25}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
