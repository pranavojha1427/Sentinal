import json
import requests
import os
import re
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

with open('missing_to_seed.json', 'r') as f:
    missing = json.load(f)

def clean_num(val):
    if not val: return None
    val = val.replace(',', '').replace('(', '').replace(')', '').strip()
    if val == '-' or not val: return None
    try:
        return float(val)
    except:
        return None

projects = []
for p in missing:
    # CLEAN THE PROJECT NAME!
    name = " ".join(p['project_name'])
    name = re.sub(r"\(.*?\) \(\d+\) Total \(\d+\) ", "", name)
    name = re.sub(r"\(.*?\) \(-\) Total \(\d+\) ", "", name)
    name = re.sub(r"\(\-\) \(\d+\) Total \(\d+\) ", "", name)
    name = re.sub(r"Project Assessment, Infrastructure Monitoring and Analytics for Nation-building \(PAIMANA\) All Ongoing Project Name Sl.No \(Agency\) \(Project Code\) \(Legacy OCMS Code\) \(PMGID\) ", "", name)
    name = re.sub(r"Note:.*?rectified\.", "", name)
    name = re.sub(r"Projects with Revised Cost Less than Rs\. 150 cr may or may not be correct, Project Assessment, Infrastructure Monitoring and Analytics for Nation-building \(PAIMANA\)", "", name)
    name = name.replace("Ministry of Petroleum & Natural Gas Energy Storage ", "")
    name = name.replace("Ministry of Ports, Shipping and Waterways Inland Waterways ", "")
    name = name.strip()
    
    if len(name) < 5:
        # Fallback if regex wipes it all out
        name = " ".join(p['project_name'])[:200]
        
    proj = {
        "project_code": f"({p['project_code']})",
        "project_name": name[:255], # Ensure it fits in DB
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
    "Prefer": "resolution=merge-duplicates"
}

url = f"{SUPABASE_URL}/rest/v1/projects?on_conflict=project_code"
response = requests.post(url, headers=headers, json=projects)

if response.status_code in [201, 204]:
    print(f"Successfully recovered {len(projects)} missing projects.")
else:
    print(f"Failed to seed: {response.status_code}")
    print(response.text)
