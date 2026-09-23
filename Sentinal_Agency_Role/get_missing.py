import pdfplumber
import re
import psycopg2
import json

def get_db_codes():
    with open(r'C:\Users\Pranav\.gemini\antigravity\brain\925a2b3c-a1a3-4fcc-8ccd-c339e409d7a9\.system_generated\steps\503\output.txt', 'r', encoding='utf-8') as f:
        text = f.read()
    codes = set(re.findall(r'\\?"project_code\\?":\\?"\(?(\d{6})\)?\\?"', text))
    
    # Also add the 18 we seeded manually
    with open('missing_projects.txt', 'r', encoding='utf-8') as f:
        missing_text = f.read()
    seeded = set(re.findall(r'^(\d{6}):', missing_text, re.MULTILINE))
    return codes | seeded

db_codes = get_db_codes()

import test_extract2
all_p = test_extract2.extract_all()

missing_projects = []
for p in all_p:
    if p['project_code'] and p['project_code'] not in db_codes:
        missing_projects.append(p)

print(f"Found {len(missing_projects)} missing projects.")
with open('missing_to_seed.json', 'w') as f:
    json.dump(missing_projects, f, indent=2)
