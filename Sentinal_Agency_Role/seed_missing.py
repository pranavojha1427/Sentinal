import re
import os
import requests
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

def clean_num(val):
    if not val: return None
    val = val.replace(',', '').replace('₹', '').replace('Cr', '').replace('%', '').strip()
    try:
        return float(val)
    except:
        return None

projects = []
with open('missing_projects.txt', 'r', encoding='utf-8') as f:
    content = f.read().strip()
    
blocks = content.split('\n\n')
for block in blocks:
    lines = [l.strip() for l in block.split('\n') if l.strip()]
    if not lines: continue
    
    # Line 1: Code and Name
    match1 = re.match(r'^(\d{6}):\s*(.*)$', lines[0])
    code = match1.group(1)
    name = match1.group(2)
    
    # Line 2: State
    state = lines[1].replace('State:', '').strip()
    
    # Line 3: Cost
    cost_str = lines[2].replace('Original Cost / Revised:', '').strip()
    costs = cost_str.split('/')
    orig = clean_num(costs[0])
    rev = clean_num(costs[1]) if len(costs) > 1 else orig
    
    # Line 4: Expenditure
    exp = clean_num(lines[3].replace('Expenditure:', ''))
    
    # Line 5: Progress
    prog = clean_num(lines[4].replace('Physical Progress:', ''))
    
    proj = {
        "project_code": f"({code})",
        "project_name": name,
        "agency": "Unknown Agency",
        "state": state,
        "original_cost": orig,
        "revised_cost": rev,
        "cumulative_expenditure": exp,
        "physical_progress": prog,
        "sector": "Others", # Dashboard will map it dynamically based on name
        "hml_category": "Others"
    }
    projects.append(proj)

# Insert via Supabase API
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
