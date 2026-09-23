"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/lib/supabaseClient"; // Assuming this exists

// Fix Leaflet's default icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GeoJSONFeature {
  type: string;
  geometry: any;
  properties: any;
}

export default function DemandMap() {
  const [requests, setRequests] = useState<GeoJSONFeature[]>([]);
  const [hotspots, setHotspots] = useState<GeoJSONFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch Hotspots GeoJSON
      const { data: hotspotData, error: hotspotError } = await supabase.rpc("get_demand_hotspots_geojson");
      if (hotspotData && hotspotData.features) {
        setHotspots(hotspotData.features);
      }

      // Fetch Requests GeoJSON
      const { data: reqData, error: reqError } = await supabase.rpc("get_citizen_requests_geojson");
      if (reqData && reqData.features) {
        setRequests(reqData.features);
      }
      
      setLoading(false);
    }
    
    fetchData();
    
    // Set up real-time subscription for new citizen requests
    const channel = supabase
      .channel("public:citizen_requests")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "citizen_requests" }, () => {
        // Simple reload on new data (could be optimized)
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center bg-slate-100 animate-pulse rounded-lg">Loading Demand Map...</div>;

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={[22.9, 78.9]} // Center of India
        zoom={5} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render Hotspot Polygons */}
        {hotspots.map((h, idx) => {
          // GeoJSON polygon coordinates are [ [ [lon, lat], ... ] ]
          // Leaflet expects [ [lat, lon], ... ]
          const coords = h.geometry.coordinates[0].map((c: number[]) => [c[1], c[0]]);
          return (
            <Polygon 
              key={`hotspot-${idx}`} 
              positions={coords} 
              pathOptions={{ color: 'red', fillColor: '#ef4444', fillOpacity: 0.4 }}
            >
              <Popup>
                <div className="font-semibold text-lg">{h.properties.infrastructure_category} Hotspot</div>
                <div>Requests: {h.properties.request_count}</div>
                <div>Avg Sentiment: {h.properties.average_sentiment}</div>
                <div>Priority Score: {h.properties.priority_score}</div>
                <button className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">Escalate to Proposal</button>
              </Popup>
              <Tooltip sticky>{h.properties.infrastructure_category} Demand Cluster</Tooltip>
            </Polygon>
          )
        })}

        {/* Render Individual Pending Requests */}
        {requests.map((r, idx) => {
          const lon = r.geometry.coordinates[0];
          const lat = r.geometry.coordinates[1];
          return (
            <Marker key={`req-${idx}`} position={[lat, lon]}>
              <Popup>
                <div className="font-semibold">{r.properties.infrastructure_category}</div>
                <div className="text-sm italic my-1">"{r.properties.translated_text}"</div>
                <div className="text-xs">Urgency: <span className="font-bold">{r.properties.urgency_level}</span></div>
                <div className="text-xs text-slate-500">Status: {r.properties.status}</div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  );
}
