import json
import requests
import os
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

with open('missing_to_seed.json', 'r') as f:
    missing = json.load(f)

projects = []
def clean_num(val):
    if not val: return None
    val = val.replace(',', '').replace('(', '').replace(')', '').strip()
    if val == '-' or not val: return None
    try:
        return float(val)
    except:
        return None

for p in missing:
    proj = {
        "project_code": f"({p['project_code']})",
        "project_name": " ".join(p['project_name']),
        "agency": "Unknown Agency",
        "state": " ".join(p['state']) if p['state'] else "Multi-State/Unknown",
        "original_cost": (clean_num(" ".join(p['cost']).split()[0]) if p['cost'] else 0) or 0,
        "revised_cost": (clean_num(" ".join(p['cost']).split()[-1]) if p['cost'] else 0) or 0,
        "cumulative_expenditure": (clean_num(" ".join(p['cum_exp'])) if p['cum_exp'] else 0) or 0,
        "physical_progress": (clean_num(" ".join(p['phys_prog'])) if p['phys_prog'] else 0) or 0,
        "sector": "Others",
        "hml_category": "Others"
    }
    projects.append(proj)

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

url = f"{SUPABASE_URL}/rest/v1/projects"
response = requests.post(url, headers=headers, json=projects)

if response.status_code in [201, 204]:
    print(f"Successfully seeded {len(projects)} missing projects.")
else:
    print(f"Failed to seed: {response.status_code}")
    print(response.text)
