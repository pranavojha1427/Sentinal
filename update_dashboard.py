import os

path = "src/components/DashboardClientView.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """  const benchmarkProjects = useMemo(() => {
    return allProjects.map((p) => {
      let sector = "Others";
      const name = (p.project_name || "").toLowerCase();
      const ag = (p.agency || "").toLowerCase();
      if (name.match(/highway|road|bridge|nhai|expressway|nh-|bypass|nhdp/) || ag.match(/nhai|nhidcl|road/)) sector = "Roads & Highways";
      else if (name.match(/railway|freight|track|gauge/) || ag.match(/rail/)) sector = "Railways";
      else if (name.match(/coal|mine|ocp/) || ag.match(/coal|bccl|ccl|ecl|mcl|ncl|secl|wcl/)) sector = "Coal";
      else if (name.match(/petroleum|refinery|pipeline|oil|gas/) || ag.match(/ongc|iocl|bpcl|hpcl|gail/)) sector = "Oil & Gas";
      else if (name.match(/transmission|substation|grid/) || ag.match(/pgcil|powergrid/)) sector = "Transmission & Distribution";
      else if (name.match(/power|thermal|hydro|electricity|generation|ntpc|nhpc/) || ag.match(/ntpc|nhpc|power/)) sector = "Electricity Generation";
      else if (name.match(/water|sanitation|dam|irrigation|canal|sewage|reservoir|drinking/) || ag.match(/water/)) sector = "Water Resources";
      else if (name.match(/hospital|aiims|medical|health/) || ag.match(/health/)) sector = "Healthcare";
      else if (name.match(/school|university|institute|education|college/)) sector = "Education";
      else if (name.match(/metro|urban transport|mrtc/)) sector = "Urban Public Transport";
      const oc = p.original_cost || 0; const rc = p.revised_cost || oc; const exp = p.cumulative_expenditure || 0;
      return { ...p, sector, cost_overrun_pct: oc > 0 ? ((rc - oc) / oc) * 100 : 0, expenditure_progress_pct: rc > 0 ? (exp / rc) * 100 : 0, physical_progress: p.physical_progress || 0 };
    });
  }, [allProjects]);"""

new_logic = """  const benchmarkProjects = useMemo(() => {
    return allProjects.map((p) => {
      let sector = p.sector || "Others";
      
      const oc = p.original_cost || 0; const rc = p.revised_cost || oc; const exp = p.cumulative_expenditure || 0;
      return { ...p, sector, cost_overrun_pct: oc > 0 ? ((rc - oc) / oc) * 100 : 0, expenditure_progress_pct: rc > 0 ? (exp / rc) * 100 : 0, physical_progress: p.physical_progress || 0 };
    });
  }, [allProjects]);"""

content = content.replace(old_logic, new_logic)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated benchmarkProjects mapping to preserve actual sector")
