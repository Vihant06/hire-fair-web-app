"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface BarChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKeys: string[];
  colors?: string[];
  className?: string;
  height?: number;
  showLegend?: boolean;
}

export function BarChartComponent({
  data,
  xKey,
  yKeys,
  colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
  className,
  height = 300,
  showLegend = true,
}: BarChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey={xKey}
            tick={{ fill: "#64748b", fontSize: 12 }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{ color: "#1e293b", fontWeight: 600 }}
          />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[4, 0, 0, 4]}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LineChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKeys: string[];
  colors?: string[];
  className?: string;
  height?: number;
  showLegend?: boolean;
}

export function LineChartComponent({
  data,
  xKey,
  yKeys,
  colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
  className,
  height = 300,
  showLegend = true,
}: LineChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: "#64748b", fontSize: 12 }}
            stroke="#e2e8f0"
          />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} stroke="#e2e8f0" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{ color: "#1e293b", fontWeight: 600 }}
          />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Line
              key={key}
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              type="monotone"
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  className?: string;
  height?: number;
  colors?: string[];
}

export function PieChartComponent({
  data,
  className,
  height = 300,
  colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
}: PieChartProps) {
  return (
    <div className={cn("w-full flex justify-center", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart data={data}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number) => [value.toLocaleString(), ""]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}