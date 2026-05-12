"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

export function DashboardUtilizationRadial(props: {
  percent: number;
  weekBooked: number;
  capacityProxy: number;
}) {
  const chartData = [{ name: "u", value: props.percent, fill: "hsl(220 45% 48% / 0.55)" }];

  return (
    <Card className="flex h-full w-full flex-col border border-divider shadow-sm">
      <CardHeader className="flex flex-col gap-1 border-b border-divider px-4 py-4 sm:px-6">
        <h2 className="text-base font-semibold leading-tight sm:text-lg">Weekly load</h2>
        <p className="text-xs leading-relaxed text-default-500">
          Booked slots vs soft capacity ({props.capacityProxy}/week proxy)
        </p>
      </CardHeader>
      <CardBody className="flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-6 pt-2">
        <div className="relative h-[180px] w-[180px]">
          <ResponsiveContainer height="100%" width="100%">
            <RadialBarChart
              barSize={12}
              cx="50%"
              cy="50%"
              data={chartData}
              endAngle={-270}
              innerRadius="72%"
              outerRadius="100%"
              startAngle={90}
            >
              <PolarAngleAxis domain={[0, 100]} tick={false} type="number" />
              <RadialBar
                background={{ fill: "hsl(var(--heroui-default-100))" }}
                cornerRadius={8}
                dataKey="value"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold tabular-nums tracking-tight text-default-800 dark:text-default-200">
              {props.percent}%
            </span>
            <span className="text-[11px] text-default-500">utilization</span>
          </div>
        </div>
        <Progress
          aria-label="Weekly booking count"
          className="max-w-xs"
          color="primary"
          size="sm"
          value={props.weekBooked}
          maxValue={Math.max(props.capacityProxy, props.weekBooked, 1)}
        />
        <p className="text-center text-xs text-default-500">
          {props.weekBooked} active bookings this week · target proxy{" "}
          {props.capacityProxy}
        </p>
      </CardBody>
    </Card>
  );
}
