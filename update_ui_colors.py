import os

path = "src/components/ProjectTableAI.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace Overall Health section
old_health = """                <div className="space-y-2">
                  <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1">Overall Health</h3>
                  <div className="flex items-center space-x-2 pt-1">
                    {getHealthBadge(aiScores[selectedProject.id]?.overall_health)}
                  </div>
                </div>"""

new_health = """                <div className="space-y-2">
                  <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 text-center">Overall Health</h3>
                  <div className="flex items-center justify-center pt-1">
                    {getHealthBadge(aiScores[selectedProject.id]?.overall_health)}
                  </div>
                </div>"""

content = content.replace(old_health, new_health)

# Replace AI Recommendation section
old_reco = """                <div className="space-y-2 mt-4">
                  <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 text-center">
                    AI Recommendation
                  </h3>
                  <div className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-md shadow-sm font-medium text-slate-800 leading-relaxed relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    {aiScores[selectedProject.id]?.recommendation}
                  </div>
                </div>"""

new_reco = """                <div className="space-y-2 mt-4">
                  <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 text-center">
                    AI Recommendation
                  </h3>
                  {(() => {
                    const health = aiScores[selectedProject.id]?.overall_health?.toLowerCase() || "";
                    let bgClass = "bg-slate-50 border-slate-200";
                    let textClass = "text-slate-800";
                    let lineClass = "bg-slate-400";
                    
                    if (health === "critical") {
                      bgClass = "bg-red-50 border-red-200";
                      textClass = "text-red-900";
                      lineClass = "bg-red-500";
                    } else if (health === "high" || health === "at risk" || health === "medium") {
                      bgClass = "bg-orange-50 border-orange-200";
                      textClass = "text-orange-900";
                      lineClass = "bg-orange-500";
                    } else if (health === "on track" || health === "low") {
                      bgClass = "bg-green-50 border-green-200";
                      textClass = "text-green-900";
                      lineClass = "bg-green-500";
                    }

                    return (
                      <div className={`text-sm ${bgClass} border p-4 rounded-md shadow-sm font-medium ${textClass} leading-relaxed relative overflow-hidden text-center`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${lineClass}`}></div>
                        {aiScores[selectedProject.id]?.recommendation}
                      </div>
                    );
                  })()}
                </div>"""

content = content.replace(old_reco, new_reco)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated ProjectTableAI UI for dynamic colors and centered overall health")
