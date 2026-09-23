
"use client";
import { useState, useMemo } from "react";

export function AgencyLeaderboard({ agencyData, projects }: any) {
  const [ministry, setMinistry] = useState("");

  const allMinistries = useMemo(() => {
    return Array.from(new Set(projects.map((p: any) => p.ministry).filter(Boolean))).sort();
  }, [projects]);

  const filteredData = useMemo(() => {
    if (!ministry) return agencyData.slice(0, 15);
    
    // Find agencies that belong to this ministry
    const validAgencies = new Set(projects.filter((p: any) => p.ministry === ministry).map((p: any) => p.agency));
    return agencyData.filter((a: any) => validAgencies.has(a.agency)).slice(0, 15);
  }, [agencyData, projects, ministry]);

  return (
    <div className="bg-white p-4 border rounded shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-slate-800">Top Performing Agencies</h3>
        <select value={ministry} onChange={e => setMinistry(e.target.value)} className="border text-xs p-1 rounded bg-slate-50 max-w-[200px]">
          <option value="">All Ministries (Global)</option>
          {allMinistries.map((m: any) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      
      <div className="space-y-3">
        {filteredData.length === 0 ? <div className="text-xs text-slate-500">No agencies found.</div> : 
          filteredData.map((a: any, i: number) => (
          <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800 line-clamp-1" title={a.agency}>{a.agency}</p>
                <p className="text-[10px] text-slate-500">Avg Cost Overrun: {a.avg_cost_overrun_pct}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-700">{a.delay_frequency_pct}%</p>
              <p className="text-[10px] text-slate-500">Delay Freq</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
