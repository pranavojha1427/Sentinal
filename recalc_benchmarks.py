import os
import pandas as pd
from supabase import create_client

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url:
    from dotenv import load_dotenv
    load_dotenv(".env")
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(supabase_url, supabase_key)

# Fetch all projects
all_db = []
for i in range(3):
    res = supabase.table("projects").select("*").range(i*1000, (i+1)*1000 - 1).execute()
    all_db.extend(res.data)

df = pd.DataFrame(all_db)

# 1. SECTOR BENCHMARKS
print("Calculating sector benchmarks...")
sector_benchmarks = []
for sector, group in df.groupby("sector"):
    avg_cost = group["cost_overrun_pct"].mean()
    avg_exp = group["expenditure_progress_pct"].mean()
    avg_phys = group["physical_progress"].mean()
    
    sector_benchmarks.append({
        "sector": sector,
        "avg_cost_overrun_pct": float(avg_cost) if pd.notnull(avg_cost) else 0.0,
        "avg_expenditure_progress_pct": float(avg_exp) if pd.notnull(avg_exp) else 0.0,
        "avg_physical_progress": float(avg_phys) if pd.notnull(avg_phys) else 0.0,
        "project_count": int(len(group))
    })

# Upsert sector benchmarks
print(f"Upserting {len(sector_benchmarks)} sector benchmarks...")
supabase.table("sector_benchmarks").upsert(sector_benchmarks).execute()

# 2. AGENCY PERFORMANCE RANKINGS
print("Calculating agency rankings...")
agency_rankings = []
for agency, group in df.groupby("agency"):
    total = len(group)
    
    # Let's count a project as delayed if cost_overrun_pct > 0 OR physical_progress < 50% (as a proxy, or check revised_doc if we can parse it)
    # Simple proxy: if revised_cost > original_cost or physical_progress < 50
    delayed_count = int(((group["cost_overrun_pct"] > 0) | (group["physical_progress"] < 40)).sum())
    
    delay_freq = (delayed_count / total * 100) if total > 0 else 0
    avg_cost = group["cost_overrun_pct"].mean()

    agency_rankings.append({
        "agency": agency,
        "total_projects": int(total),
        "delayed_project_count": int(delayed_count),
        "delay_frequency_pct": float(delay_freq),
        "avg_cost_overrun_pct": float(avg_cost) if pd.notnull(avg_cost) else 0.0
    })

print(f"Upserting {len(agency_rankings)} agency rankings...")
# The agency table might fail if agency name is too long or there are duplicates, so we do chunks
for i in range(0, len(agency_rankings), 100):
    supabase.table("agency_performance_rankings").upsert(agency_rankings[i:i+100]).execute()

print("All calculations updated!")
