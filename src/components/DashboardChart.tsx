"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function DashboardChart({ chartData }: { chartData: any[] }) {
  const chartConfig = {
    original: {
      label: "Original Cost (₹ Cr)",
      color: "#2563eb",
    },
    revised: {
      label: "Revised Cost (₹ Cr)",
      color: "#dc2626",
    },
  };

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="sector" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="original" fill="var(--color-original)" radius={[4, 4, 0, 0]} name="Original Cost" />
          <Bar dataKey="revised" fill="var(--color-revised)" radius={[4, 4, 0, 0]} name="Revised Cost" />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
