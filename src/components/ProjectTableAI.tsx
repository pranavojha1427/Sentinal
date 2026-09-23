"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getAIHealthScores } from "@/app/actions";
import { Loader2, Sparkles } from "lucide-react";

export function ProjectTableAI({ projects }: { projects: any[] }) {
  const [aiScores, setAiScores] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchScores = async () => {
    setLoading(true);
    setHasFailed(false);
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const scores = await getAIHealthScores();
        if (scores && Object.keys(scores).length > 0) {
          setAiScores(scores);
          setLoading(false);
          return;
        }
        // Empty scores means backend was unreachable — retry
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (error) {
        console.error(`AI scores fetch attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
    // All retries exhausted
    setHasFailed(true);
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const getHealthBadge = (health: string) => {
    if (!health) return <Badge variant="outline" className="border-slate-300 text-slate-500 rounded-none">N/A</Badge>;
    
    switch (health.toLowerCase()) {
      case "critical":
        return <Badge className="bg-red-200 text-red-900 border border-red-300 rounded-none">CRITICAL</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border border-orange-200 rounded-none">HIGH</Badge>;
      case "at risk":
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 border border-amber-200 rounded-none">MEDIUM</Badge>;
      case "on track":
      case "low":
        return <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-none">LOW</Badge>;
      default:
        return <Badge className="bg-slate-200 text-slate-700 rounded-none uppercase">{health}</Badge>;
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-10 flex items-center justify-center border-t border-slate-200">
           <div className="flex flex-col items-center gap-2">
             <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
             <p className="text-sm font-mono text-blue-400">AI Engine evaluating {projects.length.toLocaleString()} projects...</p>
           </div>
        </div>
      )}
      {hasFailed && !loading && (
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-10 flex items-center justify-center border-t border-slate-200">
           <div className="flex flex-col items-center gap-3">
             <p className="text-sm font-mono text-red-400">AI Backend unavailable. Ensure backend API is correctly deployed and reachable.</p>
             <button onClick={fetchScores} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-mono rounded transition-colors">
               Retry
             </button>
           </div>
        </div>
      )}
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-slate-200 hover:bg-slate-50/50">
            <TableHead className="text-slate-600 font-mono py-4">Code</TableHead>
            <TableHead className="text-slate-600 font-mono py-4">Project Name</TableHead>
            <TableHead className="text-slate-600 font-mono py-4">Sector</TableHead>
            <TableHead className="text-slate-600 font-mono text-right py-4">Orig. Cost</TableHead>
            <TableHead className="text-slate-600 font-mono text-right py-4">Rev. Cost</TableHead>
            <TableHead className="text-slate-600 font-mono text-right py-4">Overrun %</TableHead>
            <TableHead className="text-slate-600 font-mono text-right py-4">Discrepancy</TableHead>
            <TableHead className="text-slate-600 font-mono text-right py-4">AI Health Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => {
            const aiData = aiScores[p.id];
            
            return (
              <TableRow 
                key={p.id} 
                className="border-slate-200 hover:bg-slate-200/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedProject(p);
                  setIsSheetOpen(true);
                }}
              >
                <TableCell className="font-mono text-xs text-slate-700">{p.project_code}</TableCell>
                <TableCell className="font-medium max-w-[250px] truncate text-slate-900" title={p.project_name}>{p.project_name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-slate-300 text-slate-700 font-mono rounded-none bg-slate-200/50">{p.sector}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-slate-700">{p.original_cost?.toFixed(2) || '-'}</TableCell>
                <TableCell className="text-right font-mono text-amber-500">{p.revised_cost?.toFixed(2) || '-'}</TableCell>
                <TableCell className="text-right font-mono">
                  <span className={p.costOverrunPercent > 0 ? "text-red-500" : "text-slate-600"}>
                    {p.costOverrunPercent > 0 ? '+' : ''}{p.costOverrunPercent.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className={Math.abs(p.implementationDiscrepancy) > 20 ? "text-red-500 font-bold" : "text-slate-600"}>
                    {p.implementationDiscrepancy > 0 ? '+' : ''}{p.implementationDiscrepancy.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {getHealthBadge(aiData?.overall_health)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-slate-50 border-l-2 border-slate-300 text-slate-900 overflow-y-auto sm:max-w-md w-full font-sans">
          <SheetHeader className="border-b border-slate-200 pb-4 mb-4">
            <SheetTitle className="text-xl font-bold uppercase tracking-wide text-slate-900">Explainable AI Risk Report</SheetTitle>
            <SheetDescription className="font-mono text-slate-600 text-xs uppercase">
              {selectedProject?.project_code} — AI Analysis
            </SheetDescription>
          </SheetHeader>
          
          {selectedProject && aiScores[selectedProject.id] ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 text-center">Overall Health</h3>
                <div className="flex items-center justify-center pt-1">
                  {getHealthBadge(aiScores[selectedProject.id]?.overall_health)}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 text-center">
                  AI Recommendation
                </h3>
                <div className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-md shadow-sm font-medium text-slate-800 leading-relaxed relative overflow-hidden text-center">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  {aiScores[selectedProject.id]?.recommendation}
                </div>
              </div>

              {aiScores[selectedProject.id]?.overall_health === 'Critical' && aiScores[selectedProject.id]?.SHAP_Explanation && aiScores[selectedProject.id]?.SHAP_Explanation.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-mono text-xs text-red-500 uppercase tracking-widest border-b border-slate-200 pb-1">Critical Risk Factors (SHAP)</h3>
                  <div className="flex flex-col gap-2 mt-2">
                    {aiScores[selectedProject.id].SHAP_Explanation.map((explanation: string, i: number) => {
                      const parts = explanation.split("->");
                      return (
                        <div key={i} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded">
                          <span className="text-xs text-slate-700 pr-2">{parts[0]?.trim()}</span>
                          {parts[1] && (
                            <span className="text-[10px] font-mono text-red-400 bg-red-950/30 px-2 py-1 rounded">
                              {parts[1].trim()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="bg-white p-3 border border-slate-200">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Cost Overrun Score</p>
                  <p className="text-2xl font-black text-slate-900">{aiScores[selectedProject.id]?.cost_overrun_score}</p>
                </div>
                <div className="bg-white p-3 border border-slate-200">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Schedule Risk Score</p>
                  <p className="text-2xl font-black text-slate-900">{aiScores[selectedProject.id]?.schedule_risk_score}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 font-mono text-slate-500 text-sm">
              Loading AI Explanation...
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
