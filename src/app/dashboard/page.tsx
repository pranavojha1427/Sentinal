import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { DashboardClientView } from "@/components/DashboardClientView";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMongoProjects, getProjectOverrides, applyProjectOverrides } from "@/lib/project-store";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();

  const matchFilter: any = {};
  if (session?.role === "ministry") {
    if (session.ministry) matchFilter.ministry = session.ministry;
    if (session.state) matchFilter.state = session.state;
  } else if (session?.role === "state_admin") {
    if (session.state) matchFilter.state = session.state;
  } else if (session?.role === "agency" || session?.role === "engineer") {
    if (session.agency) matchFilter.agency = session.agency;
  }
  // Central admin sees all, matchFilter remains empty

  const supabase = await createClient();

  // Fetch everything in parallel - this happens ONCE when the page first loads
  
  
  // Fetch all projects using pagination IN PARALLEL to avoid Vercel timeouts
  const pageSize = 1000;
  const estimatedTotal = 12000; // Hardcoded estimate to cover the 10,853 projects
  const pages = Math.ceil(estimatedTotal / pageSize);
  
  const promises = Array.from({ length: pages }).map((_, page) => 
    supabase
      .from("projects")
      .select("id, project_name, project_code, sector, ministry, agency, state, original_cost, revised_cost, cumulative_expenditure, physical_progress, status, original_doc, revised_doc, contractor_delay, land_acquisition_issue, forest_clearance_issue")
      .match(matchFilter)
      .range(page * pageSize, (page + 1) * pageSize - 1)
  );

  const results = await Promise.all(promises);
  
  let allProjectsRaw: any[] = [];
  for (const res of results) {
    if (res.error) {
      console.error("Error fetching from supabase chunk", res.error);
    }
    if (res.data) {
      allProjectsRaw.push(...res.data);
    }
  }


  const [agencyRes, benchRes, alertsRes, mongoAgencyProjects] = await Promise.all([
    supabase.from("agency_performance_rankings").select("*").order("delay_frequency_pct", { ascending: false }),
    supabase.from("sector_benchmarks").select("*"),
    supabase.from("project_alerts").select("*").order("id", { ascending: false }),
    getMongoProjects().catch(e => { console.error("MongoDB Fetch Error:", e); return []; }),
  ]);


  if (agencyRes.error || benchRes.error || alertsRes.error) {
    return (
      <div className="p-8 text-red-500 bg-slate-50 min-h-screen flex items-center justify-center font-mono text-center">
        <div>
          <h2 className="text-xl font-bold mb-4">Error loading dashboard metadata</h2>
          <pre className="text-left bg-white p-4 rounded text-sm text-red-400 overflow-auto max-w-4xl">
            {JSON.stringify({
              agency: agencyRes.error,
              bench: benchRes.error,
              alerts: alertsRes.error
            }, null, 2)}
          </pre>
        </div>
      </div>
    );
  };
  const baseProjects = allProjectsRaw;
  const overrides = await getProjectOverrides(baseProjects.map((p: any) => p.id)).catch(e => { console.error("MongoDB Overrides Error:", e); return []; });
  console.log("TOTAL FETCHED PROJECTS:", baseProjects.length);
  const allProjects = [
    ...applyProjectOverrides(baseProjects, overrides),
    ...(mongoAgencyProjects || [])
      .filter((p: any) => session?.role === "admin" || (session?.role === "state_admin" && p.state === session?.state) || (session?.role === "ministry" && p.ministry === session?.ministry && (session?.state ? p.state === session?.state : true)) || ((session?.role === "engineer" || session?.role === "agency") && p.agency === session?.agency) || session?.role === "user")
      .map((p: any) => { const { _id, ...rest } = p as any; return { ...rest, id: _id.toString(), _source: "mongo" }; }),
  ];

  // Exact KPIs straight from DB functions
  const { data: kpiData } = await supabase.rpc("get_portfolio_kpis");
  const kpi = kpiData?.[0] || null;

  let finalAgencyData = agencyRes.data || [];
  let finalAlertsData = alertsRes.data || [];

  if (session?.role !== "admin") {
    const allowedAgencies = new Set(allProjects.map(p => p.agency).filter(Boolean));
    const allowedProjectIds = new Set(allProjects.map(p => String(p.id)));

    finalAgencyData = finalAgencyData.filter(a => allowedAgencies.has(a.agency));
    finalAlertsData = finalAlertsData.filter(a => allowedProjectIds.has(String(a.project_id)));
  }

  return (
    <DashboardClientView 
      allProjects={allProjects} 
      agencyData={finalAgencyData}
      benchResData={benchRes.data || []}
      alertsData={finalAlertsData}
      kpi={kpi}
      currentUser={session || undefined}
    />
  );
}
