import os
import json
from supabase import create_client

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url:
    from dotenv import load_dotenv
    load_dotenv(".env")
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(supabase_url, supabase_key)

# Get all DB project codes
all_db = []
for i in range(3):
    res = supabase.table("projects").select("id, project_code, project_name").range(i*1000, (i+1)*1000 - 1).execute()
    all_db.extend(res.data)

with open("data.json", "r", encoding="utf-8") as f:
    json_data = json.load(f)

json_codes = {str(item.get("project_code")): item for item in json_data}
db_codes = {str(item.get("project_code")): item for item in all_db}

matched = 0
for code in json_codes:
    if code in db_codes:
        matched += 1

print(f"Total DB records: {len(all_db)}")
print(f"Total JSON records: {len(json_data)}")
print(f"Matched by project_code: {matched}")

# Let's try matching by project_name as a fallback
matched_name = 0
db_names = {str(item.get("project_name")).strip().lower(): item for item in all_db}
for item in json_data:
    name = str(item.get("project_name")).strip().lower()
    if name in db_names:
        matched_name += 1

print(f"Matched by project_name: {matched_name}")
