import json
import requests
import os
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}
url = f"{SUPABASE_URL}/rest/v1/projects"

import final_seed
projects = final_seed.final_projects

print("Truncating table...")
requests.delete(f"{SUPABASE_URL}/rest/v1/projects?project_code=not.is.null", headers=headers)

success_count = 0
failed_count = 0
for i, p in enumerate(projects):
    resp = requests.post(url, headers=headers, json=[p])
    if resp.status_code not in [201, 204]:
        print(f"Failed row {i} ({p['project_code']}): {resp.text}")
        
        # Try to fix by setting costs to 0
        p['original_cost'] = 0
        p['revised_cost'] = 0
        p['cumulative_expenditure'] = 0
        p['physical_progress'] = 0
        resp2 = requests.post(url, headers=headers, json=[p])
        if resp2.status_code in [201, 204]:
            print(f"-> Recovered row {i} with 0 costs.")
            success_count += 1
        else:
            print(f"-> Unrecoverable: {resp2.text}")
            failed_count += 1
    else:
        success_count += 1

print(f"Successfully seeded {success_count} projects. Failed {failed_count}.")
