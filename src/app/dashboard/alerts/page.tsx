import { createClient } from "@/utils/supabase/server";
import { AlertsDataTable } from "@/components/AlertsDataTable";

export default async function AlertsPage() {
  const supabase = await createClient();
  
  // Fetch active alerts
  const { data: alerts, error } = await supabase
    .from("project_alerts")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-red-500 bg-zinc-950 min-h-screen font-mono">
        Failed to load alerts: {error.message}
      </div>
    );
  }

  return (
    <div className="p-8 bg-zinc-950 min-h-screen text-zinc-50 font-sans">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tighter uppercase border-b-4 border-red-900 pb-2 text-white">
          Early Warning Alert System
        </h1>
        <p className="text-zinc-400 font-mono text-sm uppercase">MoSPI SIH26103 // Actionable Risk Intelligence</p>
      </div>

      <AlertsDataTable initialAlerts={alerts || []} />
    </div>
  );
}
