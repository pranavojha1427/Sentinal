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
      .select("id, original_cost, revised_cost, cumulative_expenditure, physical_progress")
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
  const chunkSize = 100;

  for (let i = 0; i < projects.length; i += chunkSize) {
    const chunk = projects.slice(i, i + chunkSize);
    
    const promises = chunk.map(async (p) => {
      try {
        const response = await fetch("http://127.0.0.1:8000/predict-risk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            original_cost: p.original_cost || 0,
            revised_cost: p.revised_cost || 0,
            expenditure: p.cumulative_expenditure || 0,
            physical_progress: p.physical_progress || 0,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          scores[p.id] = data;
        }
      } catch (err) {
        console.error(`Failed to fetch prediction for project ${p.id}`, err);
      }
    });

    await Promise.all(promises);
  }

  return scores;
}
