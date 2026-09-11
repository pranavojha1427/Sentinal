"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAIHealthScores() {
  const supabase = await createClient();
  let projects: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let fetchMore = true;

  while (fetchMore) {
    const { data, error } = await supabase
      .from("projects")
      .select("id, original_cost, revised_cost, cumulative_expenditure, physical_progress, sector, agency, state, land_acquisition_issue, forest_clearance_issue, contractor_delay, burn_rate_6m, phys_burn_rate_6m")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      console.error("Error fetching from supabase", error);
      break;
    }
    
    if (data && data.length > 0) {
      projects = [...projects, ...data];
      page++;
      if (data.length < pageSize) fetchMore = false;
    } else {
      fetchMore = false;
    }
  }

  const scores: Record<string, any> = {};
  const chunkSize = 500;

  for (let i = 0; i < projects.length; i += chunkSize) {
    const chunk = projects.slice(i, i + chunkSize);
    
    // Prepare payload for the bulk endpoint using REAL DB values
    const bulkPayload = chunk.map(p => {
        const original_cost = Number(p.original_cost) || 0;
        const exp = Number(p.cumulative_expenditure) || 0;
        const phys = Number(p.physical_progress) || 0;
        
        // Use real DB values for burn rates; fall back to approximation only if column is null
        const burnRate = p.burn_rate_6m != null ? Number(p.burn_rate_6m) : exp * 0.1;
        const physBurnRate = p.phys_burn_rate_6m != null ? Number(p.phys_burn_rate_6m) : phys * 0.1;
        
        return {
            project_id: p.id,
            original_cost: original_cost,
            sector: p.sector || "Others",
            agency: p.agency || "Unknown Agency",
            state: p.state || "Multiple",
            burn_rate_6m: burnRate,
            phys_burn_rate_6m: physBurnRate,
            // Use real DB flags; default to 0 (no issue) if column is null
            land_acquisition_issue: Number(p.land_acquisition_issue) || 0,
            forest_clearance_issue: Number(p.forest_clearance_issue) || 0,
            contractor_delay: Number(p.contractor_delay) || 0
        };
    });

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/predict-risk-bulk`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bulkPayload),
        });

        if (response.ok) {
            const results = await response.json();
            
            // Map results to scores
            results.forEach((data: any) => {
                const costOverrun = data.predictions?.predicted_cost_overrun_pct || 0;
                let health = "On Track";
                if (costOverrun > 15) health = "Critical";
                else if (costOverrun > 5) health = "At Risk";
                
                const shapExplanations: string[] = [];
                if (data.shap_attribution?.top_cost_drivers) {
                    for (const [driver, impact] of Object.entries(data.shap_attribution.top_cost_drivers)) {
                        const sign = (impact as number) > 0 ? "+" : "";
                        shapExplanations.push(`${driver} -> ${sign}${(impact as number).toFixed(2)}% cost impact`);
                    }
                }

                scores[data.project_id] = {
                    overall_health: health,
                    recommendation: `Model predicts a ${costOverrun.toFixed(1)}% cost overrun and ${data.predictions?.predicted_time_overrun_months?.toFixed(1)} months delay based on historical S-curve profiles.`,
                    SHAP_Explanation: shapExplanations,
                    cost_overrun_score: Math.min(100, Math.max(0, costOverrun * 2)).toFixed(0),
                    schedule_risk_score: Math.min(100, Math.max(0, (data.predictions?.predicted_time_overrun_months || 0) * 5)).toFixed(0)
                };
            });
        } else {
             console.error("Bulk API error:", await response.text());
        }
    } catch (err) {
        console.error(`Failed to fetch bulk predictions for chunk`, err);
    }
  }

  return scores;
}

export async function updateAlertStatus(alertId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_alerts")
    .update({ status: "Escalated" })
    .eq("id", alertId);
    
  if (error) {
    console.error("Error updating alert status:", error);
    throw new Error(error.message);
  }
}
