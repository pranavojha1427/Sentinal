"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle, AlertTriangle, ShieldAlert, XCircle } from "lucide-react";

export default function AdminGatekeeper() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch EWS Alerts
      const { data: alertData } = await supabase
        .from("ews_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (alertData) setAlerts(alertData);

      // Fetch Pending Hotspots requiring Admin Approval
      const { data: hotspotData } = await supabase
        .from("demand_hotspots")
        .select("*")
        .is("assigned_project_code", null)
        .order("priority_score", { ascending: false })
        .limit(5);

      if (hotspotData) setHotspots(hotspotData);
      
      setLoading(false);
    }

    fetchData();
  }, []);

  const approveHotspot = async (id: string) => {
    // In a real flow, this would open a modal to assign/create a project code
    alert(`Approving Hotspot ${id} for infrastructure tendering!`);
  };

  const blacklistAgency = async (agency: string) => {
    alert(`Initiating Blacklist Protocol for ${agency} due to severe citizen backlash.`);
  };

  if (loading) return <div className="animate-pulse bg-slate-100 h-64 rounded-xl"></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Hotspot Approval Gatekeeper */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <CheckCircle className="mr-2 text-green-600" />
          Proactive Demand Gatekeeper
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          AI-identified hotspots requiring Ministry approval for new project tendering.
        </p>
        
        <div className="space-y-4">
          {hotspots.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No pending hotspots.</p>
          ) : (
            hotspots.map((h) => (
              <div key={h.id} className="border border-slate-100 bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">{h.infrastructure_category} Cluster</div>
                  <div className="text-xs text-slate-500">
                    {h.request_count} verified requests • Priority: <span className="font-bold text-red-600">{h.priority_score}</span>
                  </div>
                </div>
                <button 
                  onClick={() => approveHotspot(h.id)}
                  className="bg-indigo-600 text-white text-xs px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
                >
                  Approve Project
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Real-time Accountability & Blacklisting */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <ShieldAlert className="mr-2 text-red-600" />
          Real-Time Agency Accountability
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Early Warning System driven by negative citizen sentiment on active projects.
        </p>

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No critical sentiment alerts.</p>
          ) : (
            alerts.map((a) => (
              <div key={a.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-red-800 text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {a.alert_type}
                    </div>
                    <div className="font-semibold text-slate-800 mt-1">{a.agency_name}</div>
                    <div className="text-xs text-slate-600 mt-1">{a.message}</div>
                    <div className="text-xs text-slate-400 mt-1">Project: {a.project_code}</div>
                  </div>
                  <button 
                    onClick={() => blacklistAgency(a.agency_name)}
                    className="flex items-center text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded hover:bg-red-200"
                  >
                    <XCircle className="w-3 h-3 mr-1" /> Blacklist
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
