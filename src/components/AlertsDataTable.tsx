"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AlertsDataTable({ initialAlerts }: { initialAlerts: any[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignee, setAssignee] = useState("");

  const handleEscalate = (alert: any) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const submitAssignment = async () => {
    if (!selectedAlert || !assignee.trim()) return;

    // Optimistically update the UI
    setAlerts(
      alerts.map((a) =>
        a.id === selectedAlert.id ? { ...a, status: "Assigned", assigned_to: assignee } : a
      )
    );

    // Close modal
    setIsModalOpen(false);
    setAssignee("");

    // In a real implementation, we would also call a server action or API to update Supabase here:
    // await updateAlertAssignment(selectedAlert.id, assignee);
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === "Critical") {
      return (
        <Badge className="bg-red-950 text-red-500 border border-red-900 rounded-none font-mono">
          CRITICAL
        </Badge>
      );
    } else if (severity === "Warning") {
      return (
        <Badge className="bg-amber-950 text-amber-500 border border-amber-900 rounded-none font-mono">
          WARNING
        </Badge>
      );
    }
    return <Badge className="bg-slate-200 text-slate-700 rounded-none">{severity}</Badge>;
  };

  return (
    <>
      <div className="border-2 border-slate-200 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
        <Table>
          <TableHeader className="bg-slate-50 border-b-2 border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-slate-600 font-mono py-4 uppercase">Project Code</TableHead>
              <TableHead className="text-slate-600 font-mono py-4 uppercase">Alert Type</TableHead>
              <TableHead className="text-slate-600 font-mono py-4 uppercase">Trigger Reason</TableHead>
              <TableHead className="text-slate-600 font-mono py-4 uppercase">Severity</TableHead>
              <TableHead className="text-slate-600 font-mono py-4 uppercase">Status</TableHead>
              <TableHead className="text-right text-slate-600 font-mono py-4 uppercase">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500 font-mono">
                  No active alerts found. System normal.
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow key={alert.id} className="border-b border-slate-200 hover:bg-slate-200/50 transition-colors">
                  <TableCell className="font-mono text-slate-700 font-bold">{alert.project_code}</TableCell>
                  <TableCell className="font-mono text-slate-800 uppercase">{alert.alert_type}</TableCell>
                  <TableCell className="text-sm text-slate-600 max-w-md">{alert.trigger_reason}</TableCell>
                  <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-mono uppercase tracking-wider ${
                        alert.status === "Assigned" ? "text-emerald-500" : "text-slate-600"
                      }`}
                    >
                      {alert.status || "Open"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEscalate(alert)}
                      className="bg-transparent border-slate-300 text-slate-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-none font-mono uppercase tracking-tight"
                    >
                      Escalate
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-50 border-2 border-slate-200 text-slate-900 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] rounded-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-xl border-b border-slate-200 pb-2">
              Escalate Action
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Assign this alert to an officer or agency for immediate intervention.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="assignee" className="text-xs font-mono uppercase text-slate-500">
                Target Agency / Officer
              </label>
              <input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="e.g. NHAI Nodal Officer"
                className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-zinc-500 rounded-none"
              />
            </div>
            
            {selectedAlert && (
              <div className="bg-white/50 p-3 border border-slate-200 mt-2">
                <div className="text-xs text-slate-500 font-mono uppercase mb-1">Alert Details</div>
                <div className="text-sm text-slate-700 font-bold mb-1">{selectedAlert.project_code} - {selectedAlert.alert_type}</div>
                <div className="text-xs text-slate-600">{selectedAlert.trigger_reason}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="rounded-none border-slate-300 text-slate-600 hover:bg-slate-200 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={submitAssignment}
              disabled={!assignee.trim()}
              className="rounded-none bg-zinc-100 text-zinc-900 hover:bg-white font-mono uppercase tracking-tight"
            >
              Assign & Escalate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
