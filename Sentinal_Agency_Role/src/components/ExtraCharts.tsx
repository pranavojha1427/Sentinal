"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, PieChart, Pie, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function SectorDistributionChart({ data }: { data: any[] }) {
  // Sort data by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  
  const chartConfig = {
    count: { label: "Project Count", color: "#3b82f6" },
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#84cc16', '#64748b'];

  return (
    <div className="h-[400px] w-full flex items-center justify-center">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey="count"
            nameKey="sector"
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip content={<ChartTooltipContent />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px' }}/>
        </PieChart>
      </ChartContainer>
    </div>
  );
}

export function CostOverviewChart({ original, revised, expenditure }: { original: number, revised: number, expenditure: number }) {
  const data = [
    { name: 'Original Cost', value: original, fill: '#1e3a8a' },
    { name: 'Revised Cost', value: revised, fill: '#1d4ed8' },
    { name: 'Expenditure', value: expenditure, fill: '#2563eb' },
  ];

  const chartConfig = {
    value: { label: "Amount (Cr)", color: "#1d4ed8" },
  };

  return (
    <div className="h-[400px] w-full flex items-center justify-center">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
          <XAxis type="number" stroke="#a1a1aa" fontSize={12} tickFormatter={(val) => `₹${val/1000}k`} />
          <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={12} />
          <RechartsTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export function PhysicalProgressChart({ data }: { data: any[] }) {
  const chartConfig = {
    count: { label: "Project Count", color: "#22c55e" },
  };

  const COLORS = ['#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'];

  return (
    <div className="h-[400px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="range" stroke="#a1a1aa" fontSize={12} />
          <YAxis stroke="#a1a1aa" fontSize={12} />
          <RechartsTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={50}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export function StateDistributionChart({ data }: { data: any[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  const chartConfig = {
    count: { label: "Project Count", color: "#f59e0b" },
  };
  
  const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', 
    '#6366f1', '#84cc16', '#0ea5e9', '#d946ef', '#f97316', '#22c55e', '#a855f7', '#64748b'
  ];

  return (
    <div className="h-[400px] w-full flex items-center justify-center">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <PieChart>
          <Pie
            data={sorted}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey="count"
            nameKey="state"
          >
            {sorted.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const cost = data.originalCost || 0;
                // format correctly like ₹5,42,567.88 cr
                const formattedCost = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(cost);
                return (
                  <div className="bg-black text-white p-3 rounded-md shadow-lg border border-slate-200">
                    <p className="font-bold text-base mb-1">{data.state}</p>
                    <p className="text-sm text-slate-700">Project Count: <span className="text-white font-medium">{data.count}</span></p>
                    <p className="text-sm text-slate-700">Original Cost: <span className="text-white font-medium">₹{formattedCost} cr</span></p>
                  </div>
                );
              }
              return null;
            }} 
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
