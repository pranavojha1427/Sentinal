import { createClient } from "@/utils/supabase/server";
import { BenchmarksDashboard } from "@/components/BenchmarksDashboard";

export default async function BenchmarksPage() {
  const supabase = await createClient();

  // Fetch all sectors benchmarks
  const { data: benchmarksData, error: benchmarksError } = await supabase
    .from("sector_benchmarks")
    .select("*");

  // Fetch all projects (we need original_cost, revised_cost, expenditure, etc. to calculate metrics or use pre-calculated ones)
  // For performance in Next.js, we should only fetch the needed columns
  const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select("id, project_name, agency, state, original_cost, revised_cost, cumulative_expenditure, physical_progress");

  if (benchmarksError || projectsError) {
    return (
      <div className="p-8 text-red-500 bg-white min-h-screen font-sans">
        Failed to load data: {(benchmarksError || projectsError)?.message}
      </div>
    );
  }

  // Calculate sector and metrics for each project, just like in dashboard/page.tsx
  const projects = (projectsData || []).map((p) => {
    let sector = "Others";
    const name = (p.project_name || "").toLowerCase();
    const agency = (p.agency || "").toLowerCase();
    
    if (name.match(/highway|road|bridge|nhai|expressway|nh-|bypass|nhdp/) || agency.match(/nhai|nhidcl|road/)) sector = "Roads & Highways";
    else if (name.match(/railway|freight|track|gauge/) || agency.match(/rail/)) sector = "Railways";
    else if (name.match(/coal|mine|ocp/) || agency.match(/coal|bccl|ccl|ecl|mcl|ncl|secl|wcl/)) sector = "Coal";
    else if (name.match(/petroleum|refinery|pipeline|oil|gas/) || agency.match(/ongc|iocl|bpcl|hpcl|gail/)) sector = "Oil & Gas";
    else if (name.match(/transmission|substation|grid/) || agency.match(/pgcil|powergrid/)) sector = "Transmission & Distribution";
    else if (name.match(/power|thermal|hydro|electricity|generation|ntpc|nhpc/) || agency.match(/ntpc|nhpc|power/)) sector = "Electricity Generation";
    else if (name.match(/water|sanitation|dam|irrigation|canal|sewage|reservoir|drinking/) || agency.match(/water/)) sector = "Water Resources";
    else if (name.match(/hospital|aiims|medical|health/) || agency.match(/health/)) sector = "Healthcare";
    else if (name.match(/school|university|institute|education|college/)) sector = "Education";
    else if (name.match(/metro|urban transport|mrtc/)) sector = "Urban Public Transport";

    const originalCost = p.original_cost || 0;
    const revisedCost = p.revised_cost || originalCost;
    const expenditure = p.cumulative_expenditure || 0;
    
    const costEscalation = revisedCost - originalCost;
    const costOverrunPercent = originalCost > 0 ? (costEscalation / originalCost) * 100 : 0;
    const financialProgress = revisedCost > 0 ? (expenditure / revisedCost) * 100 : 0;
    
    return {
      ...p,
      sector,
      cost_overrun_pct: costOverrunPercent,
      expenditure_progress_pct: financialProgress,
      physical_progress: p.physical_progress || 0
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-1 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-light tracking-tight text-slate-900">
            Benchmarking & Comparative Analytics
          </h1>
          <p className="text-slate-500 text-sm">
            Evaluate individual project performance against historical sector benchmarks.
          </p>
        </div>

        <BenchmarksDashboard 
          projects={projects} 
          benchmarks={benchmarksData || []} 
        />
      </div>
    </div>
  );
}
