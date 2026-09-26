"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, MapPin, AlertCircle, CheckCircle2, ChevronRight, FileText, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/InspectorMapPicker"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function InspectorPortal() {
  const [loading, setLoading] = useState(true);
  const [inspector, setInspector] = useState<any>(null);
  
  // Login states
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Dashboard states
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  
  // Report states
  const [reportText, setReportText] = useState("");
  const [proposedProjectTitle, setProposedProjectTitle] = useState("");
  const [exactLat, setExactLat] = useState<number | null>(null);
  const [exactLng, setExactLng] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('inspector_id');
    if (savedId) {
        fetchInspectorData(savedId);
    } else {
        setLoading(false);
    }
  }, []);

  const fetchInspectorData = async (id: string) => {
    const { data: iData } = await supabase.from('inspectors').select('*').eq('id', id).single();
    if (iData) {
        setInspector(iData);
        // Fetch hotspots assigned to this inspector
        const { data: hData } = await supabase.from('demand_hotspots').select('*').eq('inspector_id', id).order('created_at', { ascending: false });
        if (hData) setHotspots(hData);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('inspectors').select('*').eq('phone', phone).eq('password', password).single();
    if (error || !data) {
        alert("Invalid phone or password");
        setLoading(false);
    } else {
        localStorage.setItem('inspector_id', data.id);
        fetchInspectorData(data.id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('inspector_id');
    setInspector(null);
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exactLat || !exactLng) {
        alert("Please pinpoint the exact location on the map.");
        return;
    }

    setSubmitting(true);
    
    // Update hotspot status with map coordinates
    const { error: hsError } = await supabase.from('demand_hotspots').update({
        status: 'project_proposed',
        inspector_report: reportText,
        exact_lat: exactLat,
        exact_lng: exactLng
    }).eq('id', selectedHotspot.id);

    setSubmitting(false);
    if (hsError) {
        alert("Failed to submit report: " + hsError.message);
    } else {
        alert("Report submitted! Ministry will now review your field report and exact map coordinates.");
        setSelectedHotspot(null);
        setReportText("");
        setProposedProjectTitle("");
        setExactLat(null);
        setExactLng(null);
        fetchInspectorData(inspector.id);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  if (!inspector) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-8 text-center">
              <ShieldAlert className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Inspector Portal</h1>
              <p className="text-slate-300 text-sm mt-1">Field Examination Login</p>
            </div>
            <div className="p-8 space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition mt-4">
                  Secure Login
                </button>
              </form>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <div className="font-bold text-lg flex items-center"><ShieldAlert className="w-5 h-5 mr-2" /> Field Inspector Dashboard</div>
        <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-300">{inspector.name} ({inspector.state})</span>
            <button onClick={handleLogout} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 mt-6">
        
        {selectedHotspot ? (
            <div className="bg-white p-8 border border-slate-200 rounded-lg shadow-sm">
                <button onClick={() => setSelectedHotspot(null)} className="text-indigo-600 font-semibold mb-6 flex items-center text-sm hover:underline"><ArrowLeft className="w-4 h-4 mr-1"/> Back to Assignments</button>
                
                <h2 className="text-2xl font-bold font-serif mb-2">Examine Hotspot</h2>
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-8 pb-6 border-b border-slate-100">
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {selectedHotspot.state}</span>
                    <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {selectedHotspot.infrastructure_category} Category</span>
                    <span className="flex items-center"><Hash className="w-4 h-4 mr-1" /> {selectedHotspot.request_count} Citizen Requests</span>
                </div>

                <form onSubmit={submitReport} className="space-y-6 max-w-2xl">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Field Examination Report</label>
                        <p className="text-xs text-slate-500 mb-2">Describe what you found at the location and whether a project is required.</p>
                        <textarea required value={reportText} onChange={e=>setReportText(e.target.value)} className="w-full h-32 p-3 border border-slate-300 rounded focus:border-indigo-500 outline-none resize-none" placeholder="Enter detailed findings..."></textarea>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center"><MapIcon className="w-4 h-4 mr-1 text-indigo-600"/> Exact Location Selection</label>
                        <p className="text-xs text-slate-500 mb-3">Please pinpoint the exact coordinates for the proposed initiative.</p>
                        <MapPicker onLocationSelect={(lat, lng) => {
                            setExactLat(lat);
                            setExactLng(lng);
                        }} />
                        {exactLat && exactLng && (
                            <div className="mt-2 text-xs font-mono text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">
                                Selected: {exactLat.toFixed(6)}, {exactLng.toFixed(6)}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Proposed Initiative / Project Title</label>
                        <p className="text-xs text-slate-500 mb-2">This initiative will be sent directly to the Ministry to start a formal project (which will eventually go to bidding).</p>
                        <input type="text" required value={proposedProjectTitle} onChange={e=>setProposedProjectTitle(e.target.value)} className="w-full p-3 border border-slate-300 rounded focus:border-indigo-500 outline-none" placeholder="e.g. Coal Mine Remediation Phase 1" />
                    </div>

                    <button disabled={submitting} type="submit" className="w-full py-3 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 transition flex justify-center items-center">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FileText className="w-5 h-5 mr-2" /> Submit Report & Propose Project</>}
                    </button>
                </form>
            </div>
        ) : (
            <div>
                <h1 className="text-2xl font-bold font-serif mb-6">Assigned Hotspots</h1>
                
                {hotspots.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded border border-slate-200 text-slate-500">
                        You have no active assignments.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {hotspots.map((h) => (
                            <div key={h.id} className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${h.status === 'project_proposed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{h.status.replace('_', ' ').toUpperCase()}</span>
                                    <span className="text-xs font-mono text-slate-400">ID: {h.id.split('-')[0]}</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-1">{h.infrastructure_category} Issue</h3>
                                <p className="text-sm text-slate-500 mb-4 flex items-center"><MapPin className="w-4 h-4 mr-1"/> {h.state} Region</p>
                                
                                <div className="p-3 bg-slate-50 rounded border border-slate-100 mb-6 text-sm">
                                    <strong className="text-slate-700">{h.request_count}</strong> similar complaints grouped here.
                                </div>

                                {h.status === 'project_proposed' ? (
                                    <div className="text-emerald-600 text-sm font-semibold flex items-center"><CheckCircle2 className="w-4 h-4 mr-2"/> Examined & Proposed</div>
                                ) : (
                                    <button onClick={() => setSelectedHotspot(h)} className="w-full py-2 bg-indigo-50 text-indigo-700 font-semibold rounded hover:bg-indigo-100 transition flex justify-between items-center px-4">
                                        Examine Location <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

// Simple dummy icon components inside file since I can't import easily if missing
function ArrowLeft(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>; }
function ShieldAlert(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>; }
function Hash(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>; }
