"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import AdminGatekeeper from "@/components/AdminGatekeeper";

// Dynamically import the map to avoid SSR "window is not defined" error
const DemandMap = dynamic(() => import("@/components/DemandMap"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-slate-100 animate-pulse flex items-center justify-center rounded-xl border border-slate-200 text-slate-500">Initializing Participatory Engine Maps...</div>
});

export default function ParticipatoryDemandPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Participatory Priority Engine</h1>
        <p className="text-slate-500 mt-2">
          Real-time geospatial intelligence mapping citizen demand to infrastructure allocation.
          Red zones indicate AI-identified demand hotspots automatically escalated to ministries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Suspense fallback={<div>Loading Maps...</div>}>
            <DemandMap />
          </Suspense>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Hotspot Escalation Engine</h3>
            <ul className="text-sm space-y-3 text-slate-600">
              <li className="flex items-start">
                <span className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                <span>Individual citizen complaints appear as <strong className="text-slate-800">blue markers</strong>. AI extracts the category, sentiment, and urgency.</span>
              </li>
              <li className="flex items-start">
                <span className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-red-500 flex-shrink-0"></span>
                <span>When 5+ complaints of the same category cluster within 5km, a <strong className="text-slate-800">Red Polygon Hotspot</strong> is formed via PostGIS DBSCAN.</span>
              </li>
              <li className="flex items-start">
                <span className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-green-500 flex-shrink-0"></span>
                <span>These hotspots automatically generate predictive impact scores and are routed to the relevant Ministry.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-5 rounded-xl border border-slate-200 shadow-sm text-white">
            <h3 className="font-semibold mb-2">Simulate Incoming Data</h3>
            <p className="text-xs text-indigo-100 mb-4">
              Our FastAPI ingestion layer is connected. You can simulate high-volume citizen complaints submitted via the PragatiPulse portal to watch the map react in real-time.
            </p>
            <button className="w-full py-2 bg-white text-blue-700 text-sm font-semibold rounded shadow-sm hover:bg-slate-50 transition-colors">
              Run Demand Simulation
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-200">
        <AdminGatekeeper />
      </div>
    </div>
  );
}
