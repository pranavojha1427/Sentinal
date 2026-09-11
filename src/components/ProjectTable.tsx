"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

export function ProjectTable({ projects }: { projects: any[] }) {
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [riskData, setRiskData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleRowClick = async (p: any) => {
    setSelectedProject(p)
    setIsSheetOpen(true)
    setRiskData(null)
    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/predict-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_cost: p.original_cost || 0,
          revised_cost: p.revised_cost || 0,
          expenditure: p.cumulative_expenditure || 0,
          physical_progress: p.physical_progress || 0
        })
      })
      if (res.ok) {
        const data = await res.json()
        setRiskData(data)
      } else {
        console.error("Failed to fetch risk data")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => (
            <TableRow 
              key={p.id} 
              className="border-slate-200 hover:bg-slate-200/50 transition-colors cursor-pointer"
              onClick={() => handleRowClick(p)}
            >
              <TableCell className="font-mono text-xs text-slate-700">{p.project_code}</TableCell>
              <TableCell className="font-medium max-w-[300px] truncate text-slate-900" title={p.project_name}>{p.project_name}</TableCell>
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
            </TableRow>
          ))}
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
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-100"></div>
              <p className="font-mono text-sm text-slate-600 animate-pulse uppercase">Computing SHAP values...</p>
            </div>
          ) : riskData ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1">Overall Health</h3>
                <div className="flex items-center space-x-2 pt-1">
                  <Badge className={`rounded-none font-mono text-sm px-3 py-1 uppercase ${riskData.overall_health === 'Critical' ? 'bg-red-900 text-red-100 border border-red-700 hover:bg-red-900' : riskData.overall_health === 'At Risk' ? 'bg-amber-900 text-amber-100 border border-amber-700 hover:bg-amber-900' : 'bg-emerald-900 text-emerald-100 border border-emerald-700 hover:bg-emerald-900'}`}>
                    {riskData.overall_health}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1">AI Recommendation</h3>
                <p className="text-sm bg-white border border-slate-200 p-3 font-medium text-slate-700">
                  {riskData.recommendation}
                </p>
              </div>

              {riskData.overall_health === 'Critical' && riskData.SHAP_Explanation && riskData.SHAP_Explanation.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-mono text-xs text-red-500 uppercase tracking-widest border-b border-slate-200 pb-1">Critical Risk Factors (SHAP)</h3>
                  <div className="bg-white border border-slate-200 p-0">
                    <Table>
                      <TableBody>
                        {riskData.SHAP_Explanation.map((explanation: string, i: number) => {
                          const parts = explanation.split("->");
                          return (
                            <TableRow key={i} className="border-b border-slate-200/50 hover:bg-slate-200/20">
                              <TableCell className="text-xs text-slate-700 py-3">{parts[0]?.trim()}</TableCell>
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

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="bg-white p-3 border border-slate-200">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Cost Overrun Score</p>
                  <p className="text-2xl font-black text-slate-900">{riskData.cost_overrun_score}</p>
                </div>
                <div className="bg-white p-3 border border-slate-200">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Schedule Risk Score</p>
                  <p className="text-2xl font-black text-slate-900">{riskData.schedule_risk_score}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 font-mono text-slate-500 text-sm">
              No data available.
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
