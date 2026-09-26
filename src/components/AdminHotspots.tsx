"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, MapPin, AlertCircle, ShieldAlert, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/InspectorMapPicker"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function AdminHotspots({ currentUser }: { currentUser?: any }) {
  const [unassignedComplaints, setUnassignedComplaints] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch unassigned complaints (no hotspot_id)
    const { data: cData } = await supabase.from('citizen_requests').select('*').is('hotspot_id', null).order('created_at', { ascending: false });
    
    // Group similar complaints by state & category for UI grouping
    const grouped = (cData || []).reduce((acc: any, curr) => {
      const key = `${curr.state}-${curr.infrastructure_category}`;
      if (!acc[key]) acc[key] = { state: curr.state, category: curr.infrastructure_category, complaints: [] };
      acc[key].complaints.push(curr);
      return acc;
    }, {});
    
    // Only show groups with 2+ complaints as potential hotspots
    setUnassignedComplaints(Object.values(grouped).filter((g: any) => g.complaints.length >= 2));

    // Fetch existing hotspots
    const { data: hData } = await supabase.from('demand_hotspots')
        .select(`
            *,
            inspectors ( name, phone )
        `)
        .order('created_at', { ascending: false });
    
    setHotspots(hData || []);
    setLoading(false);
  };

  const handleCreateAndAssign = async (group: any) => {
    // 1. Find a random inspector in that state
    const { data: insData } = await supabase.from('inspectors').select('*').eq('state', group.state);
    if (!insData || insData.length === 0) {
        alert(`No inspectors found in ${group.state}. Please create one first.`);
        return;
    }
    const randomInspector = insData[Math.floor(Math.random() * insData.length)];

    // 2. Create Hotspot
    const { data: hData, error: hError } = await supabase.from('demand_hotspots').insert({
        state: group.state,
        infrastructure_category: group.category,
        request_count: group.complaints.length,
        inspector_id: randomInspector.id,
        status: 'assigned',
        // Mock a polygon center using the first complaint's location
        hotspot_polygon: group.complaints[0].location
    }).select().single();

    if (hError || !hData) {
        alert("Error creating hotspot: " + (hError?.message || ""));
        return;
    }

    // 3. Link complaints to Hotspot
    for (let c of group.complaints) {
        await supabase.from('citizen_requests').update({ hotspot_id: hData.id }).eq('id', c.id);
    }

    alert(`Hotspot created and assigned to Inspector ${randomInspector.name} (${group.state})`);
    fetchData();
  };

  const handleRaiseProject = async (hotspot: any) => {
    // The Ministry raises a project from the Field Report
    // It creates a MongoDB Proposal that goes to Admin
    const project_title = prompt("Enter Project Title for this Initiative:");
    if (!project_title) return;

    // Fetch the project that was temporarily put into postgres by the inspector
    const { data: pData } = await supabase.from('projects').select('*').eq('hml_category', hotspot.infrastructure_category).eq('state', hotspot.state).order('created_at', { ascending: false }).limit(1);

    const description = hotspot.inspector_report || "Raised from Field Report";
    const amountStr = prompt("Enter Estimated Budget (in Crores):", "50");
    if (!amountStr) return;
    const amount = parseFloat(amountStr) || 0;

    const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: project_title,
            description: description,
            amount: amount,
            category: hotspot.infrastructure_category,
            location: hotspot.state,
            timeline: "24 months",
            hotspot_id: hotspot.id
        })
    });

    if (res.ok) {
        alert("Project Proposal sent to Admin for Bidding Verification!");
        // Update hotspot status
        await supabase.from('demand_hotspots').update({ status: 'project_raised' }).eq('id', hotspot.id);
        fetchData();
    } else {
        alert("Failed to raise project.");
    }
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></div>;

  return (
    <div className="p-6 bg-slate-50 border border-slate-200 space-y-8">
      
      {/* Potential Hotspots - Only Admin sees this */}
      {currentUser?.role === 'admin' && (
      <div>
        <h2 className="text-2xl font-bold font-serif text-slate-800 flex items-center mb-1"><AlertCircle className="w-6 h-6 mr-2 text-rose-500" /> Detected Demand Hotspots</h2>
        <p className="text-slate-500 text-sm mb-6">Groups of similar citizen complaints awaiting inspector assignment.</p>

        {unassignedComplaints.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded text-slate-500">No new potential hotspots detected.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unassignedComplaints.map((group, idx) => (
              <div key={idx} className="bg-white p-6 border border-slate-200 shadow-sm rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded-full">{group.category}</span>
                    <div className="text-slate-700 font-semibold mt-3 flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-400"/> {group.state} Region</div>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-800">{group.complaints.length}</span>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Complaints</div>
                  </div>
                </div>

                <div className="space-y-3 mt-6 border-t border-slate-100 pt-4 h-32 overflow-y-auto pr-2">
                  {group.complaints.map((c: any) => (
                    <div key={c.id} className="text-sm border-l-2 border-slate-200 pl-3">
                      <span className="font-semibold text-slate-700">{c.citizen_name || 'Anonymous'}:</span> <span className="text-slate-600">{c.description}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button onClick={() => handleCreateAndAssign(group)} className="w-full py-3 bg-slate-900 text-white font-semibold rounded hover:bg-indigo-600 transition flex justify-center items-center">
                    <ShieldAlert className="w-4 h-4 mr-2" /> Make Hotspot & Assign Inspector
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Active Assignments & Field Reports */}
      <div>
        <h2 className="text-2xl font-bold font-serif text-slate-800 flex items-center mb-1">
            <CheckCircle2 className="w-6 h-6 mr-2 text-emerald-500" /> 
            {currentUser?.role === 'admin' ? "Active Assignments" : "Field Reports & Initiatives"}
        </h2>
        <p className="text-slate-500 text-sm mb-6">Track hotspots that are currently assigned to field inspectors or have proposed initiatives.</p>

        {hotspots.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded text-slate-500">No hotspots have been created yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {hotspots.map((h) => {
                // If ministry, only show those that are proposed
                if (currentUser?.role === 'ministry' && h.status !== 'project_proposed' && h.status !== 'project_raised') return null;

                return (
                 <div key={h.id} className="bg-white p-6 border border-slate-200 shadow-sm rounded-lg relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${h.status === 'project_proposed' ? 'bg-emerald-500' : h.status === 'project_raised' ? 'bg-indigo-500' : 'bg-amber-500'}`}></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-full">{h.infrastructure_category}</span>
                        <div className="text-slate-700 font-semibold mt-3 flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-400"/> {h.state} Region</div>
                        </div>
                        <div className="text-right">
                        <div className="text-xs font-mono text-slate-400 mb-1">ID: {h.id.split('-')[0]}</div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${h.status === 'project_proposed' ? 'bg-emerald-100 text-emerald-700' : h.status === 'project_raised' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                            {h.status.replace('_', ' ')}
                        </span>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Citizen Requests:</span>
                            <span className="font-bold text-slate-700">{h.request_count}</span>
                        </div>
                        {currentUser?.role === 'admin' && h.inspectors && (
                        <div className="flex justify-between">
                            <span className="text-slate-500">Inspector:</span>
                            <span className="font-semibold text-slate-700">{h.inspectors.name}</span>
                        </div>
                        )}
                        {h.inspector_report && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <span className="text-xs font-bold text-emerald-600 uppercase mb-1 block flex items-center"><FileText className="w-3 h-3 mr-1"/> Inspector Report</span>
                                <p className="text-slate-600 text-sm italic">"{h.inspector_report}"</p>
                            </div>
                        )}
                    </div>

                    {currentUser?.role === 'ministry' && h.status === 'project_proposed' && (
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button onClick={() => handleRaiseProject(h)} className="w-full py-3 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition flex justify-center items-center">
                                Raise Project Proposal
                            </button>
                        </div>
                    )}
                 </div>
                );
             })}
          </div>
        )}
      </div>

    </div>
  );
}
