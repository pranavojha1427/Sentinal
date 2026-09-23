import os

path = "src/components/ProjectTableAI.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'import { Loader2 } from "lucide-react";',
    'import { Loader2, Sparkles } from "lucide-react";'
)

old_ui = """              <div className="space-y-2">
                <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1">AI Recommendation</h3>
                <p className="text-sm bg-white border border-slate-200 p-3 font-medium text-slate-700">
                  {aiScores[selectedProject.id]?.recommendation}
                </p>
              </div>"""

new_ui = """              <div className="space-y-2 mt-4">
                <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  AI Recommendation
                </h3>
                <div className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-md shadow-sm font-medium text-slate-800 leading-relaxed relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  {aiScores[selectedProject.id]?.recommendation}
                </div>
              </div>"""

content = content.replace(old_ui, new_ui)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated ProjectTableAI UI")
