// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RadarTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip
} from "recharts";

type Project = {
  id: string;
  project_name: string;
  sector: string;
  cost_overrun_pct: number;
  expenditure_progress_pct: number;
  physical_progress: number;
};

type Benchmark = {
  sector: string;
  avg_cost_overrun_pct: number;
  avg_expenditure_progress_pct: number;
  avg_physical_progress: number;
};

export function BenchmarksDashboard({ projects, benchmarks }: { projects: Project[], benchmarks: Benchmark[] }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(String(projects[0]?.id || ""));

  const selectedProject = useMemo(() => {
    return projects.find(p => String(p.id) === String(selectedProjectId));
  }, [projects, selectedProjectId]);

  const sectorBenchmark = useMemo(() => {
    if (!selectedProject) return null;
    const found = benchmarks.find(b => b.sector === selectedProject.sector);
    return found || {
      sector: selectedProject.sector,
      avg_cost_overrun_pct: 0,
      avg_expenditure_progress_pct: 0,
      avg_physical_progress: 0
    };
  }, [benchmarks, selectedProject]);

  if (!selectedProject) {
    return <div className="p-8 text-center text-slate-500">No project selected. Please ensure you have active projects.</div>;
  }

  // Data for Charts
  const chartData = [
    {
      metric: "Cost Overrun (%)",
      Project: Number(selectedProject.cost_overrun_pct.toFixed(1)),
      Sector: Number(sectorBenchmark.avg_cost_overrun_pct.toFixed(1)),
      fullMark: 100
    },
    {
      metric: "Financial Progress (%)",
      Project: Number(selectedProject.expenditure_progress_pct.toFixed(1)),
      Sector: Number(sectorBenchmark.avg_expenditure_progress_pct.toFixed(1)),
      fullMark: 100
    },
    {
      metric: "Physical Progress (%)",
      Project: Number(selectedProject.physical_progress.toFixed(1)),
      Sector: Number(sectorBenchmark.avg_physical_progress.toFixed(1)),
      fullMark: 100
    }
  ];

  // Dynamic Summary Generation
  const finDiff = selectedProject.expenditure_progress_pct - sectorBenchmark.avg_expenditure_progress_pct;
  const physDiff = selectedProject.physical_progress - sectorBenchmark.avg_physical_progress;
  const costDiff = selectedProject.cost_overrun_pct - sectorBenchmark.avg_cost_overrun_pct;

  const finText = finDiff > 0 ? `spending ${finDiff.toFixed(1)}% faster` : `spending ${Math.abs(finDiff).toFixed(1)}% slower`;
  const physText = physDiff > 0 ? `${physDiff.toFixed(1)}% ahead of` : `${Math.abs(physDiff).toFixed(1)}% behind`;
  
  let costText = "";
  if (selectedProject.cost_overrun_pct > 5 && costDiff > 0) {
    costText = ` Additionally, it suffers a severe cost overrun (${selectedProject.cost_overrun_pct.toFixed(1)}%), which is ${costDiff.toFixed(1)}% worse than the sector norm.`;
  } else if (selectedProject.cost_overrun_pct <= 0) {
    costText = ` Impressively, it has maintained its budget without any cost escalation.`;
  } else {
    costText = ` Its cost overrun sits at ${selectedProject.cost_overrun_pct.toFixed(1)}%, compared to the sector average of ${sectorBenchmark.avg_cost_overrun_pct.toFixed(1)}%.`;
  }

  const dynamicSummary = `Compared to the historical average for the '${selectedProject.sector}' sector, this project is ${finText}, while its physical execution is ${physText} the sector baseline.${costText}`;

  return (
    <div className="flex flex-col gap-8">
      {/* Selector */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
        <label htmlFor="project-select" className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
          Select Project to Benchmark
        </label>
        <select
          id="project-select"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.project_name.length > 120 ? p.project_name.substring(0, 120) + "..." : p.project_name} ({p.sector})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-medium text-slate-800 self-start mb-6 border-b border-slate-100 w-full pb-2">
            Performance Radar
          </h3>
          <div className="w-full min-h-[350px] relative">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Selected Project" dataKey="Project" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Radar name={`${selectedProject.sector} Average`} dataKey="Sector" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.4} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <RadarTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#334155', fontWeight: 500 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dual Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-medium text-slate-800 self-start mb-6 border-b border-slate-100 w-full pb-2">
            Comparative Variance
          </h3>
          <div className="w-full min-h-[350px] relative">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <BarTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar name="Selected Project" dataKey="Project" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar name={`${selectedProject.sector} Average`} dataKey="Sector" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dynamic Summary */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-sm">
        <h4 className="text-blue-800 font-semibold mb-2 text-sm uppercase tracking-wider">AI Insight</h4>
        <p className="text-blue-900 text-lg leading-relaxed font-light">
          {dynamicSummary}
        </p>
      </div>
    </div>
  );
}
