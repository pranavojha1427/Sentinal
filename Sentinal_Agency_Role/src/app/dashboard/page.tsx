import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { DashboardClientView } from "@/components/DashboardClientView";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMongoProjects, getProjectOverrides, applyProjectOverrides } from "@/lib/project-store";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();

  // Fetch everything in parallel - this happens ONCE when the page first loads
  const [req1, req2, req3, agencyRes, benchRes, alertsRes, mongoAgencyProjects] = await Promise.all([
    supabase.from("projects").select("*")
      .match(session.role === "ministry" && session.ministry ? { ministry: session.ministry } : ((session.role === "engineer" || session.role === "agency") && session.agency) ? { agency: session.agency } : {})
      .range(0, 999),
    supabase.from("projects").select("*")
      .match(session.role === "ministry" && session.ministry ? { ministry: session.ministry } : ((session.role === "engineer" || session.role === "agency") && session.agency) ? { agency: session.agency } : {})
      .range(1000, 1999),
    supabase.from("projects").select("*")
      .match(session.role === "ministry" && session.ministry ? { ministry: session.ministry } : ((session.role === "engineer" || session.role === "agency") && session.agency) ? { agency: session.agency } : {})
      .range(2000, 2999),
    supabase.from("agency_performance_rankings").select("*").order("delay_frequency_pct", { ascending: false }),
    supabase.from("sector_benchmarks").select("*"),
    supabase.from("project_alerts").select("*").order("id", { ascending: false }),
    getMongoProjects(),
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

  const baseProjects = [
    ...(req1.data || []),
    ...(req2.data || []),
    ...(req3.data || [])
  ];
  const overrides = await getProjectOverrides(baseProjects.map((p: any) => p.id));
  const allProjects = [
    ...applyProjectOverrides(baseProjects, overrides),
    ...(mongoAgencyProjects || [])
      .filter((p: any) => session.role === "admin" || (session.role === "ministry" && p.ministry === session.ministry) || ((session.role === "engineer" || session.role === "agency") && p.agency === session.agency) || session.role === "user")
      .map((p: any) => { const { _id, ...rest } = p as any; return { ...rest, id: _id.toString(), _source: "mongo" }; }),
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
      currentUser={session}
    />
  );
}
