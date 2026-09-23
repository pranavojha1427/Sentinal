import os

path = "src/app/dashboard/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_return = """  return (
    <DashboardClientView 
      allProjects={allProjects} 
      agencyData={agencyRes.data || []}
      benchResData={benchRes.data || []}
      alertsData={alertsRes.data || []}
      kpi={kpi}
      currentUser={session}
    />
  );"""

new_return = """  let finalAgencyData = agencyRes.data || [];
  let finalAlertsData = alertsRes.data || [];

  if (session.role !== "admin") {
    const allowedAgencies = new Set(allProjects.map(p => p.agency).filter(Boolean));
    const allowedProjectIds = new Set(allProjects.map(p => String(p.id)));

    finalAgencyData = finalAgencyData.filter(a => allowedAgencies.has(a.agency));
    finalAlertsData = finalAlertsData.filter(a => allowedProjectIds.has(String(a.project_id)));
  }

  return (
    <DashboardClientView 
      allProjects={allProjects} 
      agencyData={finalAgencyData}
      benchResData={benchRes.data || []}
      alertsData={finalAlertsData}
      kpi={kpi}
      currentUser={session}
    />
  );"""

content = content.replace(old_return, new_return)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated page.tsx filtering")
