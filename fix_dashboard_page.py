with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """  const session = await getSession();

  const matchFilter: any = {};
  if (session?.role === "ministry") {
    if (session.ministry) matchFilter.ministry = session.ministry;
    if (session.state) matchFilter.state = session.state;
  } else if (session?.role === "state_admin") {
    if (session.state) matchFilter.state = session.state;
  } else if (session?.role === "agency" || session?.role === "engineer") {
    if (session.agency) matchFilter.agency = session.agency;
  }
  // Central admin sees all, matchFilter remains empty

  const supabase = await createClient();

  // Fetch everything in parallel - this happens ONCE when the page first loads
  const [req1, req2, req3, agencyRes, benchRes, alertsRes, mongoAgencyProjects] = await Promise.all([
    supabase.from("projects").select("*").match(matchFilter).range(0, 999),
    supabase.from("projects").select("*").match(matchFilter).range(1000, 1999),
    supabase.from("projects").select("*").match(matchFilter).range(2000, 2999),
    supabase.from("agency_performance_rankings").select("*").order("delay_frequency_pct", { ascending: false }),
    supabase.from("sector_benchmarks").select("*"),
    supabase.from("project_alerts").select("*").order("id", { ascending: false }),
    getMongoProjects().catch(e => { console.error("MongoDB Fetch Error:", e); return []; }),
  ]);"""

import re
content = re.sub(
    r'  const session = await getSession\(\);.*?getMongoProjects\(\)\.catch\(e => \{ console\.error\("MongoDB Fetch Error:", e\); return \[\]; \}\),\n  \]\);',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
