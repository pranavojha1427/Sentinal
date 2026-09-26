with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

dynamic_agency_code = """
  const benchmarkProjects = useMemo(() => {
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
      else if (name.match(/water|river|dam|irrigation/) || ag.match(/water|cwc/)) sector = "Water Resources";
      else if (name.match(/health|hospital|aiims|medical/) || ag.match(/hcc/)) sector = "Healthcare";
      else if (name.match(/school|university|iit|nit|education/) || ag.match(/kvs|navodaya/)) sector = "Education";
      else if (name.match(/metro|urban|mrtc|smart city/) || ag.match(/metro/)) sector = "Urban Public Transport";
      const oc = p.original_cost || 0; const rc = p.revised_cost || oc; const exp = p.cumulative_expenditure || 0;
      return { ...p, sector, cost_overrun_pct: oc > 0 ? ((rc - oc) / oc) * 100 : 0, expenditure_progress_pct: rc > 0 ? (exp / rc) * 100 : 0, physical_progress: p.physical_progress || 0 };
    });
  }, [allProjects]);

  const dynamicAgencyData = useMemo(() => {
    const agencyMap = new Map<string, any>();
    benchmarkProjects.forEach(p => {
      const ag = p.agency;
      if (!ag) return;
      if (!agencyMap.has(ag)) {
        agencyMap.set(ag, { agency: ag, total_projects: 0, delayed_project_count: 0, sum_cost_overrun: 0 });
      }
      const data = agencyMap.get(ag);
      data.total_projects += 1;
      data.sum_cost_overrun += (p.cost_overrun_pct || 0);
      
      let isDelayed = false;
      if (p.original_doc && p.revised_doc) {
        if (new Date(p.revised_doc) > new Date(p.original_doc)) {
          isDelayed = true;
        }
      } else if (p.status === "Ongoing" && p.original_doc && new Date(p.original_doc) < new Date()) {
          isDelayed = true;
      }
      
      if (p.contractor_delay || p.land_acquisition_issue || p.forest_clearance_issue) isDelayed = true;
      
      if (isDelayed) {
        data.delayed_project_count += 1;
      }
    });

    const results = [];
    for (const data of agencyMap.values()) {
      data.delay_frequency_pct = (data.delayed_project_count / data.total_projects) * 100;
      data.avg_cost_overrun_pct = data.sum_cost_overrun / data.total_projects;
      
      // Round to 2 decimal places
      data.delay_frequency_pct = Math.round(data.delay_frequency_pct * 100) / 100;
      data.avg_cost_overrun_pct = Math.round(data.avg_cost_overrun_pct * 100) / 100;
      
      results.push(data);
    }

    results.sort((a, b) => {
      if (a.delay_frequency_pct !== b.delay_frequency_pct) return b.delay_frequency_pct - a.delay_frequency_pct;
      if (a.avg_cost_overrun_pct !== b.avg_cost_overrun_pct) return b.avg_cost_overrun_pct - a.avg_cost_overrun_pct;
      return b.total_projects - a.total_projects;
    });

    return results;
  }, [benchmarkProjects]);
"""

import re
content = re.sub(
    r'  const benchmarkProjects = useMemo\(\(\) => \{.*?\}, \[allProjects\]\);',
    dynamic_agency_code,
    content,
    flags=re.DOTALL
)

content = content.replace(
    'agencyData={agencyData}',
    'agencyData={dynamicAgencyData}'
)

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
