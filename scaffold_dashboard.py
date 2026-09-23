import os
def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

write_file("src/components/DashboardClientView.tsx", """
"use client";

import { useMemo, useState } from "react";
import { ProjectTable } from "@/components/ProjectTable";
import { DashboardChart } from "@/components/DashboardChart";
import { AgencyLeaderboard } from "@/components/AgencyLeaderboard";
import { ExtraCharts } from "@/components/ExtraCharts";
import { BenchmarksDashboard } from "@/components/BenchmarksDashboard";
import { StateRiskMap } from "@/components/StateRiskMap";
import { AlertsDataTable } from "@/components/AlertsDataTable";
import { ActionMatrix } from "@/components/ActionMatrix";
import { ProjectTableAI } from "@/components/ProjectTableAI";
import { AgencyProjectManager } from "@/components/AgencyProjectManager";
import type { SessionUser } from "@/lib/auth";
import { AdminAccountManager } from "@/components/AdminAccountManager";
import { NotificationBell } from "@/components/NotificationBell";
import { ProposalForm } from "@/components/ProposalForm";
import { WorkflowInbox } from "@/components/WorkflowInbox";

const TAB_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "map", label: "Map" },
  { id: "alerts", label: "AI Alerts & Insights" },
  { id: "matrix", label: "Action Matrix" },
  { id: "my-projects", label: "My Projects" },
  { id: "proposals", label: "Proposals & Bidding" },
  { id: "accounts", label: "Accounts" }
];

type Props = {
  allProjects: any[];
  agencyData: any[];
  benchResData: any[];
  alertsData: any[];
  kpi: any;
  currentUser: SessionUser;
};

export function DashboardClientView({ allProjects, agencyData, benchResData, alertsData, kpi, currentUser }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  const [stateFilter, setStateFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [ministryFilter, setMinistryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const isFiltered = stateFilter || sectorFilter || ministryFilter || currentUser.role !== "admin";

  const ALL_MINISTRIES = useMemo(() => Array.from(new Set(allProjects.map(p => p.ministry).filter(Boolean))).sort(), [allProjects]);

  const uniqueSectors = useMemo(() => Array.from(new Set(allProjects.map(p => p.sector || "Others"))).sort(), [allProjects]);
  const uniqueMinistries = ALL_MINISTRIES;
  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    allProjects.forEach(p => {
      if (p.state) {
        p.state.split(',').map((s: string) => s.trim()).forEach((s: string) => states.add(s));
      }
    });
    return Array.from(states).sort();
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      if (stateFilter && !p.state?.includes(stateFilter)) return false;
      if (sectorFilter && p.sector !== sectorFilter) return false;
      if (ministryFilter && p.ministry !== ministryFilter) return false;
      return true;
    });
  }, [allProjects, stateFilter, sectorFilter, ministryFilter]);

  const filteredKpi = useMemo(() => {
    if (!isFiltered) return kpi;
    const totalCount = filteredProjects.length;
    const totalOriginal = filteredProjects.reduce((sum, p) => sum + (Number(p.original_cost) || 0), 0);
    const totalRevised = filteredProjects.reduce((sum, p) => sum + (Number(p.revised_cost) || 0), 0);
    const totalExpenditure = filteredProjects.reduce((sum, p) => sum + (Number(p.cumulative_expenditure) || 0), 0);
    return { project_count: totalCount, total_original_cost: totalOriginal, total_revised_cost: totalRevised, total_expenditure: totalExpenditure };
  }, [filteredProjects, kpi, isFiltered]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <p className="text-slate-600 font-mono text-sm uppercase">Infrastructure Project Monitoring Platform</p>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="text-xs font-mono uppercase bg-slate-200 px-3 py-2">
              {currentUser.name} | {currentUser.role}
              {currentUser.ministry ? ` | ${currentUser.ministry}` : ""}
              {currentUser.agency ? ` | ${currentUser.agency}` : ""}
            </span>
            <a href="/api/auth/logout" className="text-xs font-mono uppercase bg-slate-900 text-white px-3 py-2 hover:bg-slate-800 transition-colors">Logout</a>
          </div>
        </div>

        <div className="px-6 flex overflow-x-auto gap-6 hide-scrollbar border-t">
          {TAB_ITEMS.filter(tab => 
            (tab.id !== "my-projects" || currentUser.role === "agency") &&
            (tab.id !== "accounts" || currentUser.role === "admin")
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded shadow-sm border flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Sector</label>
                <select className="w-full border p-2 text-sm bg-slate-50" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
                  <option value="">All Sectors</option>
                  {uniqueSectors.map((s: any) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">Ministry / Department</label>
                <select className="w-full border p-2 text-sm bg-slate-50" value={ministryFilter} onChange={(e) => setMinistryFilter(e.target.value)} disabled={currentUser.role === "ministry"}>
                  <option value={currentUser.role === "ministry" ? currentUser.ministry : ""}>{currentUser.role === "ministry" ? currentUser.ministry : "All Ministries"}</option>
                  {currentUser.role !== "ministry" && uniqueMinistries.map((m: any) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-mono text-slate-500 mb-1 uppercase">States / UTs</label>
                <select className="w-full border p-2 text-sm bg-slate-50" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                  <option value="">All States</option>
                  {uniqueStates.map((s: any) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-none">
                <button onClick={() => { setStateFilter(""); setSectorFilter(""); if(currentUser.role !== "ministry") setMinistryFilter(""); setMonthFilter(""); }} className="px-4 py-2 bg-slate-200 text-slate-700 text-sm hover:bg-slate-300 transition-colors">
                  Clear Filters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-6 rounded shadow-sm border border-blue-100 flex flex-col justify-center">
                <p className="text-xs font-bold text-blue-900 mb-2 uppercase">Project Count (in no.)</p>
                <p className="text-3xl font-serif text-slate-900">{filteredKpi?.project_count?.toLocaleString("en-IN") || 0}</p>
              </div>
              <div className="bg-amber-50 p-6 rounded shadow-sm border border-amber-100 flex flex-col justify-center">
                <p className="text-xs font-bold text-amber-900 mb-2 uppercase">Original Approved Cost (in Cr.)</p>
                <p className="text-3xl font-serif text-slate-900">?{Math.round(filteredKpi?.total_original_cost || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-rose-50 p-6 rounded shadow-sm border border-rose-100 flex flex-col justify-center">
                <p className="text-xs font-bold text-rose-900 mb-2 uppercase">Latest Revised Cost (in Cr.)</p>
                <p className="text-3xl font-serif text-slate-900">?{Math.round(filteredKpi?.total_revised_cost || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-lime-50 p-6 rounded shadow-sm border border-lime-100 flex flex-col justify-center">
                <p className="text-xs font-bold text-lime-900 mb-2 uppercase">Cumulative Expenditure (in Cr.)</p>
                <p className="text-3xl font-serif text-slate-900">?{Math.round(filteredKpi?.total_expenditure || 0).toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <DashboardChart data={filteredProjects} />
                <BenchmarksDashboard sectorData={benchResData} />
              </div>
              <div className="space-y-6">
                <AgencyLeaderboard agencyData={agencyData} projects={allProjects} />
                <ExtraCharts projects={filteredProjects} />
              </div>
            </div>

            <div className="bg-white border rounded shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Project Directory</h3>
                <span className="text-xs text-slate-500 font-mono">Showing {filteredProjects.length} records</span>
              </div>
              <ProjectTable projects={filteredProjects} />
            </div>
          </div>
        )}

        {activeTab === "proposals" && (
          <div className="space-y-8">
            <WorkflowInbox currentUser={currentUser} />
            {(currentUser.role === "agency" || currentUser.role === "ministry") && (
              <ProposalForm currentUser={currentUser} onSuccess={() => window.location.reload()} />
            )}
          </div>
        )}

        {activeTab === "my-projects" && currentUser.role === "agency" && (
           <AgencyProjectManager projects={allProjects.filter((p: any) => p.agency === currentUser.agency)} agency={currentUser.agency} />
        )}

        {activeTab === "accounts" && currentUser.role === "admin" && (
           <AdminAccountManager />
        )}

        {activeTab === "map" && <StateRiskMap projects={filteredProjects} />}
        {activeTab === "alerts" && <AlertsDataTable alerts={alertsData} />}
        {activeTab === "matrix" && <ActionMatrix projects={filteredProjects} />}
      </main>
    </div>
  );
}
"""
)
print("DashboardClientView generated")
