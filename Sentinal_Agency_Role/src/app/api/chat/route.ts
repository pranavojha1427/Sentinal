import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Fetch aggregate stats to give the LLM real data
    const [totalRes, sectorRes, stateRes] = await Promise.all([
      supabase.from('projects').select('original_cost, revised_cost, cumulative_expenditure, ministry').limit(2000),
      supabase.rpc('get_sector_stats').maybeSingle(), // may not exist
      supabase.rpc('get_state_stats').maybeSingle(),  // may not exist
    ]);

    const projects = totalRes.data || [];

    // Build ministry-level aggregates
    const ministryAgg: Record<string, { count: number; original: number; revised: number; expenditure: number }> = {};
    for (const p of projects) {
      const m = p.ministry || 'Other';
      if (!ministryAgg[m]) ministryAgg[m] = { count: 0, original: 0, revised: 0, expenditure: 0 };
      ministryAgg[m].count++;
      ministryAgg[m].original += p.original_cost || 0;
      ministryAgg[m].revised += p.revised_cost || p.original_cost || 0;
      ministryAgg[m].expenditure += p.cumulative_expenditure || 0;
    }

    // Check if the question is about a specific state
    const stateMatch = message.match(/in\s+([\w\s]+?)[\s?.,!]*$/i);
    let stateData = '';
    if (stateMatch) {
      const stateName = stateMatch[1].trim();
      const { data: stateProjects } = await supabase
        .from('projects')
        .select('project_name, sector, ministry, original_cost, revised_cost, cumulative_expenditure, physical_progress')
        .ilike('state', `%${stateName}%`)
        .limit(50);
      
      if (stateProjects && stateProjects.length > 0) {
        const totalO = stateProjects.reduce((s, p) => s + (p.original_cost || 0), 0);
        const totalR = stateProjects.reduce((s, p) => s + (p.revised_cost || p.original_cost || 0), 0);
        const totalE = stateProjects.reduce((s, p) => s + (p.cumulative_expenditure || 0), 0);
        stateData = `\nData for "${stateName}": ${stateProjects.length} projects, Original Cost: ${totalO.toFixed(2)} Cr, Revised Cost: ${totalR.toFixed(2)} Cr, Expenditure: ${totalE.toFixed(2)} Cr, Cost Overrun: ${totalO > 0 ? (((totalR - totalO) / totalO) * 100).toFixed(1) : 0}%`;
        stateData += `\nTop projects: ${stateProjects.slice(0, 10).map(p => `${p.project_name} (O:${p.original_cost}, R:${p.revised_cost}, Progress:${p.physical_progress}%)`).join('; ')}`;
      }
    }

    const totalOriginal = projects.reduce((s, p) => s + (p.original_cost || 0), 0);
    const totalRevised = projects.reduce((s, p) => s + (p.revised_cost || p.original_cost || 0), 0);
    const totalExpenditure = projects.reduce((s, p) => s + (p.cumulative_expenditure || 0), 0);

    const ministryStr = Object.entries(ministryAgg)
      .sort((a, b) => b[1].original - a[1].original)
      .map(([m, d]) => `${m}: ${d.count} projects, O=${d.original.toFixed(0)}, R=${d.revised.toFixed(0)}, E=${d.expenditure.toFixed(0)}`)
      .join('\n');

    const systemPrompt = `You are a Project Intelligence Assistant for MoSPI officials. All values in INR Crores.
Total: ${projects.length} projects, Original: ${totalOriginal.toFixed(0)} Cr, Revised: ${totalRevised.toFixed(0)} Cr, Expenditure: ${totalExpenditure.toFixed(0)} Cr.
Ministry breakdown:\n${ministryStr}${stateData}
Answer using Markdown with tables. Be concise. Do NOT output <think> tags or reasoning.`;

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
    responseText = responseText.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();
    
    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ response: `**Error:** ${error.message}` }, { status: 500 });
  }
}
