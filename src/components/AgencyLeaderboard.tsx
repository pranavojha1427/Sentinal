import { createClient } from "@/utils/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function AgencyLeaderboard() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agency_performance_rankings")
    .select("*")
    .order("delay_frequency_pct", { ascending: false });

  if (error) {
    console.error("Error fetching agency rankings:", error);
    return <div>Error loading agency leaderboard.</div>;
  }

  return (
    <Card className="bg-white border-slate-200 rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
      <CardHeader>
        <CardTitle className="font-mono uppercase tracking-wide border-b border-slate-200 pb-2">Agency Performance Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-slate-200/50">
              <TableHead className="font-mono text-slate-600">Agency</TableHead>
              <TableHead className="font-mono text-slate-600 text-right">Total Projects</TableHead>
              <TableHead className="font-mono text-slate-600 text-right">Delayed Count</TableHead>
              <TableHead className="font-mono text-slate-600 text-right">Delay Frequency (%)</TableHead>
              <TableHead className="font-mono text-slate-600 text-right">Avg Cost Overrun (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((agency, index) => {
              const isHighDelay = agency.delay_frequency_pct > 40;
              return (
                <TableRow 
                  key={index} 
                  className={`border-slate-200 ${isHighDelay ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-100'}`}
                >
                  <TableCell className="font-medium text-slate-800">
                    {agency.agency}
                    {isHighDelay && <Badge variant="destructive" className="ml-2 text-[10px] uppercase">Warning</Badge>}
                  </TableCell>
                  <TableCell className="text-right text-slate-700">{agency.total_projects}</TableCell>
                  <TableCell className="text-right text-slate-700">{agency.delayed_project_count}</TableCell>
                  <TableCell className={`text-right ${isHighDelay ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                    {agency.delay_frequency_pct}%
                  </TableCell>
                  <TableCell className="text-right text-slate-700">{agency.avg_cost_overrun_pct}%</TableCell>
                </TableRow>
              );
            })}
            {data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-4">No data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
