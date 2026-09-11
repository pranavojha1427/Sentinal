import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def s_curve(t, L, k, t0):
    """Logistic function for S-curve generation"""
    return L / (1 + np.exp(-k * (t - t0)))

def generate_history():
    print("Fetching projects from Supabase...")
    # Fetch all projects - since limit is 1000 by default, loop through to get all 1981
    all_projects = []
    page_size = 1000
    for i in range(3):
        response = supabase.table("projects").select("*").range(i*page_size, (i+1)*page_size-1).execute()
        if not response.data:
            break
        all_projects.extend(response.data)

    print(f"Fetched {len(all_projects)} projects. Synthesizing 24-month history...")
    
    start_date = datetime(2024, 4, 1)
    history_records = []
    
    # We'll save the final snapshot targets in a separate structure so we can join it easily for ML
    ml_dataset = []

    for p in all_projects:
        project_id = p["id"]
        # Sector derivation matching JS and SQL
        name = (p.get("project_name") or "").lower()
        agency = (p.get("agency") or "").lower()
        sector = "Others"
        if any(x in name for x in ["highway", "road", "bridge", "nhai", "expressway", "nh-", "bypass", "nhdp"]) or any(x in agency for x in ["nhai", "nhidcl", "road"]): sector = "Roads & Highways"
        elif any(x in name for x in ["railway", "freight", "track", "gauge"]) or "rail" in agency: sector = "Railways"
        elif any(x in name for x in ["coal", "mine", "ocp"]) or any(x in agency for x in ["coal", "bccl", "ccl", "ecl", "mcl", "ncl", "secl", "wcl"]): sector = "Coal"
        elif any(x in name for x in ["petroleum", "refinery", "pipeline", "oil", "gas"]) or any(x in agency for x in ["ongc", "iocl", "bpcl", "hpcl", "gail"]): sector = "Oil & Gas"
        elif any(x in name for x in ["transmission", "substation", "grid"]) or any(x in agency for x in ["pgcil", "powergrid"]): sector = "Transmission & Distribution"
        elif any(x in name for x in ["power", "thermal", "hydro", "electricity", "generation", "ntpc", "nhpc"]) or any(x in agency for x in ["ntpc", "nhpc", "power"]): sector = "Electricity Generation"
        elif any(x in name for x in ["water", "sanitation", "dam", "irrigation", "canal", "sewage", "reservoir", "drinking"]) or "water" in agency: sector = "Water Resources"
        elif any(x in name for x in ["hospital", "aiims", "medical", "health"]) or "health" in agency: sector = "Healthcare"
        elif any(x in name for x in ["school", "university", "institute", "education", "college"]): sector = "Education"
        elif any(x in name for x in ["metro", "urban transport", "mrtc"]): sector = "Urban Public Transport"

        original_cost = p.get("original_cost") or 0.0
        
        # In a real scenario, issues happen randomly and cause escalation
        # We synthesize random issues heavily weighting them to create a correlated dataset
        land_issue = random.random() < 0.25 # 25% chance
        forest_issue = random.random() < 0.15 # 15% chance
        contractor_delay = random.random() < 0.30 # 30% chance
        
        # Calculate final impacts
        cost_overrun_pct = random.uniform(-2, 5) # Base natural overrun/underrun
        time_overrun_months = random.randint(-1, 3) 
        
        if land_issue:
            cost_overrun_pct += random.uniform(15, 45)
            time_overrun_months += random.randint(12, 36)
        if forest_issue:
            cost_overrun_pct += random.uniform(5, 20)
            time_overrun_months += random.randint(6, 24)
        if contractor_delay:
            cost_overrun_pct += random.uniform(10, 30)
            time_overrun_months += random.randint(8, 20)
            
        final_cost = original_cost * (1 + cost_overrun_pct / 100.0)
        
        # S-curve parameters
        # Total duration usually 4-8 years (48-96 months). We assume 24 months represents some slice of this.
        total_duration = 60 + time_overrun_months
        t0_cost = total_duration * random.uniform(0.4, 0.6) # Midpoint
        k_cost = random.uniform(0.08, 0.15)
        
        t0_phys = total_duration * random.uniform(0.45, 0.65)
        k_phys = random.uniform(0.07, 0.12)
        
        start_month_offset = random.randint(0, 36) # How far into the project we start (April 2024)
        
        prev_exp = 0
        prev_phys = 0
        
        history = []
        for m in range(24):
            current_date = start_date + timedelta(days=30*m)
            t = start_month_offset + m
            
            expenditure = s_curve(t, final_cost, k_cost, t0_cost)
            phys_prog = s_curve(t, 100.0, k_phys, t0_phys)
            
            # Ensure monotonicity
            expenditure = max(expenditure, prev_exp)
            phys_prog = max(phys_prog, prev_phys)
            
            # Add some noise
            expenditure *= random.uniform(0.99, 1.01)
            phys_prog *= random.uniform(0.99, 1.01)
            
            # Cap at max
            expenditure = min(expenditure, final_cost)
            phys_prog = min(phys_prog, 100.0)
            
            prev_exp = expenditure
            prev_phys = phys_prog
            
            history.append({
                "project_id": project_id,
                "snapshot_date": current_date.strftime("%Y-%m-%d"),
                "cumulative_expenditure": expenditure,
                "physical_progress": phys_prog
            })
            
        # Burn rate is expenditure over the last 6 months
        burn_rate = history[-1]["cumulative_expenditure"] - history[-7]["cumulative_expenditure"]
        phys_burn_rate = history[-1]["physical_progress"] - history[-7]["physical_progress"]
        
        ml_dataset.append({
            "project_id": project_id,
            "sector": sector,
            "agency": p.get("agency") or "Unknown",
            "state": p.get("state") or "Multiple",
            "original_cost": original_cost,
            "land_acquisition_issue": int(land_issue),
            "forest_clearance_issue": int(forest_issue),
            "contractor_delay": int(contractor_delay),
            "burn_rate_6m": burn_rate,
            "phys_burn_rate_6m": phys_burn_rate,
            "target_cost_overrun_pct": cost_overrun_pct,
            "target_time_overrun_months": time_overrun_months
        })

    # Save outputs
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)
    
    df_ml = pd.DataFrame(ml_dataset)
    df_ml.to_csv(os.path.join(data_dir, "ml_training_dataset.csv"), index=False)
    
    print(f"Dataset generated with {len(df_ml)} records for ML training.")
    print(df_ml.head())

if __name__ == "__main__":
    generate_history()
