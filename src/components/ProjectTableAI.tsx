"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getAIHealthScores } from "@/app/actions";
import { Loader2 } from "lucide-react";

export function ProjectTableAI({ projects }: { projects: any[] }) {
  const [aiScores, setAiScores] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    // Call the server action to fetch all projects and their AI scores
    const fetchScores = async () => {
      try {
        const scores = await getAIHealthScores();
        setAiScores(scores);
      } catch (error) {
        console.error("Failed to load AI scores:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScores();
  }, []);

  const getHealthBadge = (health: string) => {
    if (!health) return <Badge variant="outline" className="border-zinc-700 text-zinc-500 rounded-none"><Loader2 className="h-3 w-3 animate-spin mr-1" /> Analyzing</Badge>;
    
    switch (health) {
      case "Critical":
        return <Badge className="bg-red-950 text-red-500 border border-red-900 rounded-none">CRITICAL</Badge>;
      case "At Risk":
        return <Badge className="bg-amber-950 text-amber-500 border border-amber-900 rounded-none">AMBER</Badge>;
      case "On Track":
        return <Badge className="bg-emerald-950 text-emerald-500 border border-emerald-900 rounded-none">GREEN</Badge>;
      default:
        return <Badge className="bg-zinc-800 text-zinc-300 rounded-none">{health}</Badge>;
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm z-10 flex items-center justify-center border-t border-zinc-800">
           <div className="flex flex-col items-center gap-2">
             <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
             <p className="text-sm font-mono text-blue-400">AI Engine evaluating 1,981 projects...</p>
           </div>
        </div>
      )}
      <Table>
        <TableHeader className="bg-zinc-950">
          <TableRow className="border-zinc-800 hover:bg-zinc-950/50">
            <TableHead className="text-zinc-400 font-mono py-4">Code</TableHead>
            <TableHead className="text-zinc-400 font-mono py-4">Project Name</TableHead>
            <TableHead className="text-zinc-400 font-mono py-4">Sector</TableHead>
            <TableHead className="text-zinc-400 font-mono text-right py-4">Orig. Cost</TableHead>
            <TableHead className="text-zinc-400 font-mono text-right py-4">Rev. Cost</TableHead>
            <TableHead className="text-zinc-400 font-mono text-right py-4">Overrun %</TableHead>
            <TableHead className="text-zinc-400 font-mono text-right py-4">Discrepancy</TableHead>
            <TableHead className="text-zinc-400 font-mono text-right py-4">AI Health Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => {
            const aiData = aiScores[p.id];
            
            return (
              <TableRow 
                key={p.id} 
                className="border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedProject(p);
                  setIsSheetOpen(true);
                }}
              >
                <TableCell className="font-mono text-xs text-zinc-300">{p.project_code}</TableCell>
                <TableCell className="font-medium max-w-[250px] truncate text-zinc-100" title={p.project_name}>{p.project_name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-300 font-mono rounded-none bg-zinc-800/50">{p.sector}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-zinc-300">{p.original_cost?.toFixed(2) || '-'}</TableCell>
                <TableCell className="text-right font-mono text-amber-500">{p.revised_cost?.toFixed(2) || '-'}</TableCell>
                <TableCell className="text-right font-mono">
                  <span className={p.costOverrunPercent > 0 ? "text-red-500" : "text-zinc-400"}>
                    {p.costOverrunPercent > 0 ? '+' : ''}{p.costOverrunPercent.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className={Math.abs(p.implementationDiscrepancy) > 20 ? "text-red-500 font-bold" : "text-zinc-400"}>
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
        <SheetContent className="bg-zinc-950 border-l-2 border-zinc-700 text-zinc-100 overflow-y-auto sm:max-w-md w-full font-sans">
          <SheetHeader className="border-b border-zinc-800 pb-4 mb-4">
            <SheetTitle className="text-xl font-bold uppercase tracking-wide text-zinc-100">Explainable AI Risk Report</SheetTitle>
            <SheetDescription className="font-mono text-zinc-400 text-xs uppercase">
              {selectedProject?.project_code} — AI Analysis
            </SheetDescription>
          </SheetHeader>
          
          {selectedProject && aiScores[selectedProject.id] ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-mono text-xs text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-1">Overall Health</h3>
                <div className="flex items-center space-x-2 pt-1">
                  {getHealthBadge(aiScores[selectedProject.id]?.overall_health)}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-xs text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-1">AI Recommendation</h3>
                <p className="text-sm bg-zinc-900 border border-zinc-800 p-3 font-medium text-zinc-300">
                  {aiScores[selectedProject.id]?.recommendation}
                </p>
              </div>

              {aiScores[selectedProject.id]?.overall_health === 'Critical' && aiScores[selectedProject.id]?.SHAP_Explanation && aiScores[selectedProject.id]?.SHAP_Explanation.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-mono text-xs text-red-500 uppercase tracking-widest border-b border-zinc-800 pb-1">Critical Risk Factors (SHAP)</h3>
                  <div className="bg-zinc-900 border border-zinc-800 p-0">
                    <Table>
                      <TableBody>
                        {aiScores[selectedProject.id].SHAP_Explanation.map((explanation: string, i: number) => {
                          const parts = explanation.split("->");
                          return (
                            <TableRow key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                              <TableCell className="text-xs text-zinc-300 py-3">{parts[0]?.trim()}</TableCell>
                              <TableCell className="text-xs font-mono text-red-400 py-3 text-right">
                                {parts[1] ? `-> ${parts[1].trim()}` : ''}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                <div className="bg-zinc-900 p-3 border border-zinc-800">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Cost Overrun Score</p>
                  <p className="text-2xl font-black text-zinc-100">{aiScores[selectedProject.id]?.cost_overrun_score}</p>
                </div>
                <div className="bg-zinc-900 p-3 border border-zinc-800">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Schedule Risk Score</p>
                  <p className="text-2xl font-black text-zinc-100">{aiScores[selectedProject.id]?.schedule_risk_score}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 font-mono text-zinc-500 text-sm">
              Loading AI Explanation...
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
