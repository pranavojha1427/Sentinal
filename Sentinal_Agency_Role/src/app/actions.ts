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

  const scores: Record<number, any> = {};

  projects.forEach((data) => {
      const original_cost = Number(data.original_cost) || 0;
      const revised_cost = Number(data.revised_cost) || 0;
      const expenditure = Number(data.cumulative_expenditure) || 0;
      const physical_progress = Number(data.physical_progress) || 0;

      const cost_escalation = revised_cost - original_cost;
      let cost_overrun_percent = 0.0;
      if (original_cost > 0) {
          cost_overrun_percent = (cost_escalation / original_cost) * 100;
      }
          
      let financial_progress = 0.0;
      if (revised_cost > 0) {
          financial_progress = (expenditure / revised_cost) * 100;
      }
          
      const implementation_discrepancy = physical_progress - financial_progress;
      
      const cost_overrun_score = Math.max(0.0, Math.min(100.0, cost_overrun_percent * 2));
      const schedule_risk_score = Math.max(0.0, Math.min(100.0, (100.0 - physical_progress) + Math.max(0.0, -implementation_discrepancy)));

      let overall_health = "On Track";
      let recommendation = "Continue monitoring.";

      if (cost_overrun_percent > 10.0 && physical_progress < 50.0) {
          overall_health = "Critical";
          recommendation = "Trigger financial scrutiny";
      } else if (cost_overrun_score > 30.0 || schedule_risk_score > 50.0) {
          overall_health = "At Risk";
          recommendation = "Review project execution plan and address delays.";
      }

      const shap_explanations: string[] = [];
      
      if (overall_health === "Critical") {
          if (cost_overrun_percent > 10.0) {
              shap_explanations.push(`Cost overrun is ${cost_overrun_percent.toFixed(1)}% -> High cost-risk contribution`);
          }
          if (physical_progress < 50.0) {
              shap_explanations.push(`Physical progress is ${physical_progress.toFixed(1)}% below plan -> High schedule-risk contribution`);
          }
          if (cost_escalation > 0) {
              shap_explanations.push(`Revised cost increased by ₹${cost_escalation.toFixed(1)} Cr -> Medium-high cost-risk contribution`);
          }
          if (implementation_discrepancy < -10) {
              shap_explanations.push(`Financial progress exceeds physical by ${(-implementation_discrepancy).toFixed(1)}% -> Fund diversion risk`);
          }
      }

      scores[data.id] = {
          overall_health,
          recommendation,
          SHAP_Explanation: shap_explanations,
          cost_overrun_score: cost_overrun_score.toFixed(0),
          schedule_risk_score: schedule_risk_score.toFixed(0)
      };
  });

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
