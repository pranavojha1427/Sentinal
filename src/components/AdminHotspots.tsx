"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, MapPin, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function AdminHotspots() {
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

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></div>;

  return (
    <div className="p-6 bg-slate-50 border border-slate-200 space-y-8">
      
      {/* Potential Hotspots */}
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
                    <div className="text-3xl font-black text-slate-800">{group.complaints.length}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Complaints</div>
                  </div>
                </div>
                
                <div className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded border border-slate-100 h-24 overflow-y-auto">
                    {group.complaints.map((c: any, i: number) => (
                        <div key={i} className="mb-2 pb-2 border-b border-slate-200 last:border-0 last:mb-0 last:pb-0">
                            <span className="font-semibold text-slate-700">{c.name || 'Anonymous'}:</span> {c.translated_text || c.raw_text}
                        </div>
                    ))}
                </div>

                <button 
                  onClick={() => handleCreateAndAssign(group)}
                  className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition flex items-center justify-center"
                >
                  <ShieldAlert className="w-4 h-4 mr-2" /> Make Hotspot & Assign Inspector
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Hotspots / Assigned */}
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-800 mb-4 mt-12 border-t border-slate-200 pt-8">Active Assignments</h2>
        
        {hotspots.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded text-slate-500">No active assignments.</div>
        ) : (
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="p-4 font-semibold">Hotspot ID</th>
                    <th className="p-4 font-semibold">Location & Type</th>
                    <th className="p-4 font-semibold">Assigned Inspector</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Inspector Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hotspots.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono text-xs text-slate-500">{h.id.split('-')[0]}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{h.infrastructure_category}</div>
                        <div className="text-xs text-slate-500">{h.state}</div>
                      </td>
                      <td className="p-4">
                        {h.inspectors ? (
                            <div>
                                <div className="font-semibold text-indigo-700">{h.inspectors.name}</div>
                                <div className="text-xs text-slate-500">{h.inspectors.phone}</div>
                            </div>
                        ) : <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            h.status === 'project_proposed' ? 'bg-emerald-100 text-emerald-700' :
                            h.status === 'examined' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                            {h.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-600 max-w-xs truncate">
                        {h.inspector_report ? h.inspector_report : <span className="text-slate-400 italic">Awaiting field report...</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
