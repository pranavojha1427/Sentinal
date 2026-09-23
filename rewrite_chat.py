import os

path = "src/app/api/chat/route.ts"
new_content = """import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from "@/lib/auth";
import { getMongoProjects, getProjectOverrides, applyProjectOverrides } from "@/lib/project-store";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ response: "Unauthorized" }, { status: 401 });

    const { message } = await req.json();

    // 1. Fetch base Supabase data
    let supaQuery = supabase.from('projects').select('*').limit(2000);
    if (session.role === "ministry" && session.ministry) {
      supaQuery = supaQuery.ilike('ministry', `%${session.ministry}%`);
    } else if (session.role === "agency" && session.agency) {
      supaQuery = supaQuery.ilike('agency', `%${session.agency}%`);
    }

    const { data: supaProjects, error } = await supaQuery;
    if (error) console.error("Supabase Error:", error);

    // 2. Fetch overrides and custom MongoDB projects
    const overrides = await getProjectOverrides();
    const mergedSupa = applyProjectOverrides(supaProjects || [], overrides);
    const mongoProjects = await getMongoProjects();
    
    let allProjects = [...mergedSupa, ...mongoProjects];
    
    // 3. Filter custom projects based on RBAC
    if (session.role === "ministry" && session.ministry) {
      allProjects = allProjects.filter(p => p.ministry?.toLowerCase() === session.ministry.toLowerCase());
    } else if (session.role === "agency" && session.agency) {
      allProjects = allProjects.filter(p => p.agency === session.agency);
    }

    // 4. Build ministry-level aggregates
    const ministryAgg: Record<string, { count: number; original: number; revised: number; expenditure: number }> = {};
    for (const p of allProjects) {
      const m = p.ministry || 'Other';
      if (!ministryAgg[m]) ministryAgg[m] = { count: 0, original: 0, revised: 0, expenditure: 0 };
      ministryAgg[m].count++;
      ministryAgg[m].original += Number(p.original_cost) || 0;
      ministryAgg[m].revised += Number(p.revised_cost) || Number(p.original_cost) || 0;
      ministryAgg[m].expenditure += Number(p.cumulative_expenditure) || 0;
    }

    // 5. Check if the question is about a specific state
    const stateMatch = message.match(/in\\s+([\\w\\s]+?)[\\s?.,!]*$/i);
    let stateData = '';
    if (stateMatch) {
      const stateName = stateMatch[1].trim().toLowerCase();
      const stateProjects = allProjects.filter(p => p.state?.toLowerCase().includes(stateName));
      
      if (stateProjects.length > 0) {
        const totalO = stateProjects.reduce((s, p) => s + (Number(p.original_cost) || 0), 0);
        const totalR = stateProjects.reduce((s, p) => s + (Number(p.revised_cost) || Number(p.original_cost) || 0), 0);
        const totalE = stateProjects.reduce((s, p) => s + (Number(p.cumulative_expenditure) || 0), 0);
        stateData = `\n\nData specifically for State "${stateName}": ${stateProjects.length} projects, Original Cost: ${totalO.toFixed(2)} Cr, Revised Cost: ${totalR.toFixed(2)} Cr, Expenditure: ${totalE.toFixed(2)} Cr, Cost Overrun: ${totalO > 0 ? (((totalR - totalO) / totalO) * 100).toFixed(1) : 0}%.`;
        stateData += `\nTop projects in this state: ${stateProjects.slice(0, 10).map(p => `${p.project_name} (Cost:${p.revised_cost || p.original_cost}, Progress:${p.physical_progress || 0}%)`).join('; ')}`;
      }
    }

    // 6. Aggregate totals
    const totalOriginal = allProjects.reduce((s, p) => s + (Number(p.original_cost) || 0), 0);
    const totalRevised = allProjects.reduce((s, p) => s + (Number(p.revised_cost) || Number(p.original_cost) || 0), 0);
    const totalExpenditure = allProjects.reduce((s, p) => s + (Number(p.cumulative_expenditure) || 0), 0);

    const ministryStr = Object.entries(ministryAgg)
      .sort((a, b) => b[1].original - a[1].original)
      .map(([m, d]) => `${m}: ${d.count} projects, O=${d.original.toFixed(0)}, R=${d.revised.toFixed(0)}, E=${d.expenditure.toFixed(0)}`)
      .join('\n');

    // 7. Dynamic RBAC Prompt
    const roleNotice = session.role === 'admin' 
      ? 'You have full unrestricted access to all MoSPI data.' 
      : `Due to privacy policies, you are ONLY allowed to see and discuss data belonging to their specific ${session.role}. The data provided below has already been strictly filtered for them. If they ask about other ministries or agencies, inform them they do not have clearance.`;

    const systemPrompt = `You are the MoSPI Intelligence Assistant. All monetary values in INR Crores.
You are talking to a user with role: ${session.role.toUpperCase()} (Name: ${session.name}, Organization: ${session.agency || session.ministry || 'System Admin'}).
${roleNotice}

Total Accessible Portfolio: ${allProjects.length} projects, Original Cost: ${totalOriginal.toFixed(0)} Cr, Revised Cost: ${totalRevised.toFixed(0)} Cr, Cumulative Expenditure: ${totalExpenditure.toFixed(0)} Cr.

${session.role !== 'agency' ? `Ministry breakdown:\\n${ministryStr}` : ''}${stateData}
Answer using Markdown with tables if useful. Be concise and professional. Do NOT output <think> tags or internal reasoning.`;

    // 8. Fetch from LLM
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `/no_think\n${message}` }
        ],
        temperature: 0.1,
        max_tokens: 768,
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API Error:", res.status, errText);
      throw new Error(`Groq API error: ${res.status}`);
    }

    const data = await res.json();
    let responseText = data.choices[0].message.content;
    
    // Strip <think>...</think> tags from Qwen models
    responseText = responseText.replace(/<think>[\\s\\S]*?<\\/think>\\s*/g, '').trim();
    
    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ response: `**Error:** ${error.message}` }, { status: 500 });
  }
}
"""

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Rewrote route.ts with RBAC privacy filtering")
