import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { DashboardClientView } from "@/components/DashboardClientView";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch everything in parallel - this happens ONCE when the page first loads
  const [req1, req2, req3, agencyRes, benchRes, alertsRes] = await Promise.all([
    supabase.from("projects").select("*").range(0, 999),
    supabase.from("projects").select("*").range(1000, 1999),
    supabase.from("projects").select("*").range(2000, 2999),
    supabase.from("agency_performance_rankings").select("*").order("delay_frequency_pct", { ascending: false }),
    supabase.from("sector_benchmarks").select("*"),
    supabase.from("project_alerts").select("*").order("id", { ascending: false }),
  ]);

  if (req1.error || req2.error || req3.error || agencyRes.error || benchRes.error || alertsRes.error) {
    return (
      <div className="p-8 text-red-500 bg-slate-50 min-h-screen flex items-center justify-center font-mono text-center">
        <div>
          <h2 className="text-xl font-bold mb-4">Error loading projects</h2>
          <pre className="text-left bg-white p-4 rounded text-sm text-red-400 overflow-auto max-w-4xl">
            {JSON.stringify({
              req1: req1.error,
              req2: req2.error,
              req3: req3.error,
              agency: agencyRes.error,
              bench: benchRes.error,
              alerts: alertsRes.error
            }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const allProjects = [
    ...(req1.data || []),
    ...(req2.data || []),
    ...(req3.data || [])
  ];

  // Exact KPIs straight from DB functions
  const { data: kpiData } = await supabase.rpc("get_portfolio_kpis");
  const kpi = kpiData?.[0] || null;

  return (
    <DashboardClientView 
      allProjects={allProjects} 
      agencyData={agencyRes.data || []}
      benchResData={benchRes.data || []}
      alertsData={alertsRes.data || []}
      kpi={kpi}
    />
  );
}
