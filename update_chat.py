import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace stateData matching logic with smart keyword matching
old_state_logic = """    // 5. Check if the question is about a specific state
    const stateMatch = message.match(/in\\s+([\\w\\s]+?)[\\s?.,!]*$/i);
    let stateData = '';
    if (stateMatch) {
      const stateName = stateMatch[1].trim().toLowerCase();
      const stateProjects = allProjects.filter(p => p.state?.toLowerCase().includes(stateName));
      
      if (stateProjects.length > 0) {
        const totalO = stateProjects.reduce((s, p) => s + (Number(p.original_cost) || 0), 0);
        const totalR = stateProjects.reduce((s, p) => s + (Number(p.revised_cost) || Number(p.original_cost) || 0), 0);
        const totalE = stateProjects.reduce((s, p) => s + (Number(p.cumulative_expenditure) || 0), 0);
        stateData = `

Data specifically for State "${stateName}": ${stateProjects.length} projects, Original Cost: ${totalO.toFixed(2)} Cr, Revised Cost: ${totalR.toFixed(2)} Cr, Expenditure: ${totalE.toFixed(2)} Cr, Cost Overrun: ${totalO > 0 ? (((totalR - totalO) / totalO) * 100).toFixed(1) : 0}%.`;
        stateData += `
Top projects in this state: ${stateProjects.slice(0, 10).map(p => `${p.project_name} (Cost:${p.revised_cost || p.original_cost}, Progress:${p.physical_progress || 0}%)`).join('; ')}`;
      }
    }"""

new_state_logic = """    // 5. Smart Keyword Matching for Project Injection
    const lowerMessage = message.toLowerCase();
    
    // Attempt to score and rank projects based on relevance to the user's query
    // E.g. if message contains "assam" and "railway", boost projects matching those.
    const scoredProjects = allProjects.map(p => {
      let score = 0;
      if (p.state && lowerMessage.includes(p.state.toLowerCase())) score += 50;
      if (p.sector && lowerMessage.includes(p.sector.toLowerCase())) score += 30;
      if (p.ministry && lowerMessage.includes(p.ministry.toLowerCase())) score += 30;
      if (p.project_name && lowerMessage.includes(p.project_name.toLowerCase())) score += 20;
      
      // If asking about cost overruns, boost those with high overruns
      const orig = Number(p.original_cost) || 0;
      const rev = Number(p.revised_cost) || orig;
      const overrunPct = orig > 0 ? ((rev - orig) / orig) * 100 : 0;
      
      if ((lowerMessage.includes("overrun") || lowerMessage.includes("cost")) && overrunPct > 0) {
          score += Math.min(overrunPct, 50); // Add up to 50 points based on overrun severity
      }
      if (lowerMessage.includes("delay") || lowerMessage.includes("critical")) {
          // Add score if progress is low but expenditure is high, or just generally flag it
          score += 20; 
      }
      return { ...p, score, overrunPct };
    });
    
    // Sort by score (desc) and take the top 20 most relevant projects to fit in context window
    const relevantProjects = scoredProjects.filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 20);
    
    let specificData = '';
    if (relevantProjects.length > 0) {
      specificData = `\\n\\nRelevant Project Data for Query:\\n`;
      specificData += relevantProjects.map(p => 
        `- [${p.project_name}] Sector: ${p.sector}, State: ${p.state}, Ministry: ${p.ministry}, Original Cost: ${p.original_cost}Cr, Revised Cost: ${p.revised_cost}Cr, Overrun: ${p.overrunPct.toFixed(1)}%, Expenditure: ${p.cumulative_expenditure}Cr, Progress: ${p.physical_progress}%`
      ).join('\\n');
    } else {
      // Fallback: If no specific keywords matched, just provide top 10 worst overruns overall
      const worstProjects = scoredProjects.sort((a, b) => b.overrunPct - a.overrunPct).slice(0, 10);
      specificData = `\\n\\nTop 10 Projects with Highest Cost Overruns:\\n`;
      specificData += worstProjects.map(p => 
        `- [${p.project_name}] Sector: ${p.sector}, State: ${p.state}, Ministry: ${p.ministry}, Original Cost: ${p.original_cost}Cr, Revised Cost: ${p.revised_cost}Cr, Overrun: ${p.overrunPct.toFixed(1)}%`
      ).join('\\n');
    }"""

content = content.replace(old_state_logic, new_state_logic)
content = content.replace("${stateData}", "${specificData}")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated route.ts with smart keyword matching")
