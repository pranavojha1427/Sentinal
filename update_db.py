import os
import json
import time
from supabase import create_client

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url:
    from dotenv import load_dotenv
    load_dotenv(".env")
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(supabase_url, supabase_key)

print("Fetching all DB projects...")
all_db = []
for i in range(3):
    res = supabase.table("projects").select("*").range(i*1000, (i+1)*1000 - 1).execute()
    all_db.extend(res.data)

db_dict = {str(item.get("project_code")): item for item in all_db if item.get("project_code")}

with open("data.json", "r", encoding="utf-8") as f:
    json_data = json.load(f)

print("Preparing update payload...")
updates = []
for item in json_data:
    code = str(item.get("project_code"))
    if code in db_dict:
        db_item = dict(db_dict[code]) # copy existing row
        
        orig = item.get("original_cost_rs_crore") or 0.0
        rev = item.get("revised_cost_rs_crore") or orig
        exp = item.get("cumulative_expenditure_rs_crore") or 0.0
        phys = item.get("physical_progress_percent") or 0.0
        
        # update fields
        db_item["project_name"] = item.get("project_name")
        db_item["agency"] = item.get("agency")
        db_item["sector"] = item.get("sector")
        db_item["ministry"] = item.get("ministry")
        db_item["state"] = item.get("state")
        db_item["original_cost"] = orig
        db_item["revised_cost"] = rev
        db_item["cumulative_expenditure"] = exp
        db_item["physical_progress"] = phys
        db_item["legacy_ocms_code"] = item.get("legacy_ocms_code")
        db_item["pmg_id"] = item.get("pmgid")
        
        # Remove generated columns from payload so Supabase recalculates them!
        db_item.pop("cost_overrun_pct", None)
        db_item.pop("expenditure_progress_pct", None)
        
        updates.append(db_item)

print(f"Total rows to update: {len(updates)}")

batch_size = 100
for i in range(0, len(updates), batch_size):
    batch = updates[i:i+batch_size]
    print(f"Upserting batch {i} to {i+len(batch)}...")
    supabase.table("projects").upsert(batch).execute()
    time.sleep(0.2)

print("Update completed successfully!")
