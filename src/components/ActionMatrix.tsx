"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateAlertStatus } from "@/app/actions"
import { AlertCircle, FileSearch, Landmark, ShieldAlert } from "lucide-react"

export function ActionMatrix({ initialAlerts }: { initialAlerts: any[] }) {
  const [alerts, setAlerts] = useState<any[]>(initialAlerts)
  const [isProcessing, setIsProcessing] = useState<number | null>(null)

  const handleAction = async (id: number) => {
    setIsProcessing(id)
    try {
      await updateAlertStatus(id)
      setAlerts(alerts.filter(a => a.id !== id))
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(null)
    }
  }

  const getPrescriptiveAction = (reason: string) => {
    const r = reason.toLowerCase()
    if (r.includes("progress discrepancy")) {
      return { label: "Trigger Field Inspection", icon: <FileSearch className="w-4 h-4 mr-2" />, color: "bg-blue-600 hover:bg-blue-700" }
    }
    if (r.includes("cost escalation")) {
      return { label: "Schedule Joint Financial Review", icon: <Landmark className="w-4 h-4 mr-2" />, color: "bg-amber-600 hover:bg-amber-700" }
    }
    if (r.includes("stalled milestone")) {
      return { label: "Escalate to PMG / Cabinet Secretariat", icon: <ShieldAlert className="w-4 h-4 mr-2" />, color: "bg-red-600 hover:bg-red-700" }
    }
    // Fallback
    return { label: "Request Immediate Report", icon: <AlertCircle className="w-4 h-4 mr-2" />, color: "bg-zinc-600 hover:bg-slate-300" }
  }

  if (alerts.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-200 bg-white/50">
        <p className="font-mono text-slate-500 uppercase tracking-widest">No active interventions required in queue.</p>
      </div>
    )
  }

  return (
    <div className="border-2 border-slate-200 bg-white rounded-none overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-slate-200 hover:bg-slate-50/50">
            <TableHead className="text-slate-600 font-mono py-4">Alert ID</TableHead>
            <TableHead className="text-slate-600 font-mono py-4">Project Ref</TableHead>
            <TableHead className="text-slate-600 font-mono py-4">Trigger Reason</TableHead>
            <TableHead className="text-slate-600 font-mono py-4">Severity</TableHead>
            <TableHead className="text-slate-600 font-mono py-4 text-right">Prescriptive Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => {
            const action = getPrescriptiveAction(alert.trigger_reason)
            return (
              <TableRow key={alert.id} className="border-slate-200 hover:bg-slate-200/30 transition-colors">
                <TableCell className="font-mono text-xs text-slate-700">#{alert.id}</TableCell>
                <TableCell className="font-mono text-xs text-slate-700">{alert.project_code || `PRJ-${alert.project_id}`}</TableCell>
                <TableCell className="font-medium text-slate-900 uppercase tracking-wide text-xs">{alert.trigger_reason}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-red-900 bg-red-100 text-red-500 font-mono rounded-none uppercase">
                    {alert.severity || 'High'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="default" 
                    size="sm"
                    disabled={isProcessing === alert.id}
                    onClick={() => handleAction(alert.id)}
                    className={`rounded-none font-mono uppercase text-xs tracking-wide h-8 ${action.color} text-white`}
                  >
                    {isProcessing === alert.id ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>
                        {action.icon}
                        {action.label}
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
