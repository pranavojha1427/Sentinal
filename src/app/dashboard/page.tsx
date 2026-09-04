import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardChart } from "@/components/DashboardChart";
import { SectorDistributionChart, CostOverviewChart, PhysicalProgressChart, StateDistributionChart } from "@/components/ExtraCharts";
import { ProjectTable } from "@/components/ProjectTable";
import { ProjectTableAI } from "@/components/ProjectTableAI";

const sectors = [
  "Roads & Highways", 
  "Railways", 
  "Coal", 
  "Oil & Gas", 
  "Transmission & Distribution", 
  "Electricity Generation", 
  "Water Resources", 
  "Healthcare", 
  "Education",
  "Urban Public Transport",
  "Others"
];

export default async function DashboardPage() {
  const supabase = await createClient();
  let projects: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let fetchMore = true;

  while (fetchMore) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      return (
        <div className="p-8 text-red-500 bg-zinc-950 min-h-screen flex items-center justify-center font-mono">
          <div>Error loading projects: {error.message}</div>
        </div>
      );
    }
    
    if (data && data.length > 0) {
      projects = [...projects, ...data];
      page++;
      if (data.length < pageSize) fetchMore = false;
    } else {
      fetchMore = false;
    }
  }

  const totalProjects = projects.length;
  const totalOriginalCost = projects.reduce((sum, p) => sum + (p.original_cost || 0), 0);
  const totalExpenditure = projects.reduce((sum, p) => sum + (p.cumulative_expenditure || 0), 0);
  const totalRevisedCost = projects.reduce((sum, p) => sum + (p.revised_cost || p.original_cost || 0), 0);
  
  const validStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar", "Chandigarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Lakshadweep", "Puducherry", "Jammu and Kashmir", "Ladakh"
  ];

  const sectorMap = new Map<string, { sector: string, count: number, original: number, revised: number }>();
  sectors.forEach(s => sectorMap.set(s, { sector: s, count: 0, original: 0, revised: 0 }));

  const stateMap = new Map<string, { count: number, originalCost: number }>();
  const progressCounts = { '< 20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '>= 80': 0 };

  const mappedProjects = projects.map(p => {
    let sector = p.sector || "Others";
    
    // Exact mapping to the 11 target dashboard sectors
    const targetSectors = [
      "Coal", "Education", "Electricity Generation", "Healthcare", 
      "Oil & Gas", "Railways", "Roads & Highways", "Transmission & Distribution", 
      "Urban Public Transport", "Water Resources"
    ];
    
    if (!targetSectors.includes(sector)) {
      sector = "Others";
    }

    const s = sectorMap.get(sector);
    if (s) {
      s.count += 1;
      s.original += p.original_cost || 0;
      s.revised += p.revised_cost || 0;
    }

    // Strict State Mapping from Comma-separated DB strings
    const stateStr = p.state || "Delhi";
    let matchedStates = stateStr.split(",").map((s: string) => s.trim()).filter((s: string) => s);
    if (matchedStates.length === 0) matchedStates = ["Delhi"];

    for (const st of matchedStates) {
      const current = stateMap.get(st) || { count: 0, originalCost: 0 };
      current.count += 1;
      current.originalCost += p.original_cost || 0;
      stateMap.set(st, current);
    }

    // Progress Calculation Natively
    const prog = p.physical_progress || 0;
    if (prog < 20) progressCounts['< 20']++;
    else if (prog < 40) progressCounts['20-40']++;
    else if (prog < 60) progressCounts['40-60']++;
    else if (prog < 80) progressCounts['60-80']++;
    else progressCounts['>= 80']++;

    const costEscalation = (p.revised_cost || 0) - (p.original_cost || 0);
    const costOverrunPercent = p.original_cost ? (costEscalation / p.original_cost) * 100 : 0;
    
    const financialProgress = p.revised_cost ? ((p.cumulative_expenditure || 0) / p.revised_cost) * 100 : 0;
    const implementationDiscrepancy = (p.physical_progress || 0) - financialProgress;

    return { ...p, sector, costEscalation, costOverrunPercent, financialProgress, implementationDiscrepancy };
  });

  const chartData = Array.from(sectorMap.values());
  const stateData = Array.from(stateMap.entries())
    .map(([state, data]) => ({ state, count: data.count, originalCost: data.originalCost }))
    .sort((a,b) => b.count - a.count);
  const progressData = Object.entries(progressCounts).map(([range, count]) => ({ range, count }));

  return (
    <div className="p-8 space-y-8 bg-zinc-950 min-h-screen text-zinc-50 font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tighter uppercase border-b-4 border-zinc-700 pb-2">Public Dashboard <span className="text-xl text-zinc-400 normal-case tracking-normal">(as of April 2026)</span></h1>
        <p className="text-zinc-400 font-mono text-sm uppercase">MoSPI SIH26103 // Project Monitoring Platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-sky-100 text-sky-950 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase">Project Count (in no.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-100 text-amber-950 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase">Original Approved Cost (in cr.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">₹{totalOriginalCost.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-rose-100 text-rose-950 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase">Latest Revised Cost (in cr.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">₹{totalRevisedCost.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-lime-100 text-lime-950 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase">Cumulative Expenditure (in cr.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">₹{totalExpenditure.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wide border-b border-zinc-800 pb-2">Sector-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <SectorDistributionChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wide border-b border-zinc-800 pb-2">Cost Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <CostOverviewChart original={totalOriginalCost} revised={totalRevisedCost} expenditure={totalExpenditure} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wide border-b border-zinc-800 pb-2">Physical Progress [Project Count]</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <PhysicalProgressChart data={progressData} />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wide border-b border-zinc-800 pb-2">State-wise Distribution [Project Count]</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <StateDistributionChart data={stateData} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden mt-6">
        <CardHeader>
          <CardTitle className="font-mono uppercase tracking-wide border-b border-zinc-800 pb-2">Project Database</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ProjectTableAI projects={mappedProjects} />
        </CardContent>
      </Card>
    </div>
  );
}
