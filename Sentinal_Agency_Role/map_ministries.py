import json
import os
from supabase import create_client

supabase = create_client('https://ygbtrapskuguoagegftn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYnRyYXBza3VndW9hZ2VnZnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTQ0NDYsImV4cCI6MjEwMzk5MDQ0Nn0.lcQ-_NTto0QTFHqf5J4z8waxvi_DLWEhNMRxUyacW6c')

all_data = []
page = 0
while True:
    res = supabase.table('projects').select('id, project_name, original_cost').range(page*1000, (page+1)*1000 - 1).execute()
    all_data.extend(res.data)
    if len(res.data) < 1000: break
    page += 1

with open('paimana_extracted_table6.json', 'r', encoding='utf-8') as f:
    pdf_data = json.load(f)

ministries = [
    'Department for Promotion of Industry & Internal Trade',
    'Department of Higher Education',
    'Department of Sports',
    'Department of Telecommunications',
    'Department of Water Resources, River Development & GR',
    'Ministry of Chemicals and Fertilizers',
    'Ministry of Civil Aviation',
    'Ministry of Coal',
    'Ministry of Health & Family Welfare',
    'Ministry of Housing & Urban Affairs',
    'Ministry of Labour and Employment',
    'Ministry of Mines',
    'Ministry of New & Renewable Energy',
    'Ministry of Petroleum & Natural Gas',
    'Ministry of Ports, Shipping and Waterways',
    'Ministry of Power',
    'Ministry of Railways',
    'Ministry of Road Transport & Highways',
    'Ministry of Steel'
]

# Track ministries sequentially
mapped_pdf = []
current_ministry = 'Unknown'
for p in pdf_data:
    name = p.get('project_name', '')
    agency = p.get('agency', '')
    for m in ministries:
        if name.startswith(m) or agency.startswith(m):
            current_ministry = m
            break
            
    # Hardcode fix for Department of Water Resources since it's merged
    if current_ministry == 'Unknown' and ('Water Resources' in name or 'Ganga' in name):
        current_ministry = 'Department of Water Resources, River Development & GR'
        
    mapped_pdf.append({
        'name': name,
        'cost': p.get('original_cost', 0),
        'ministry': current_ministry
    })

# Match DB to PDF
updates = []
matched_ids = set()

# First pass: strict match
for db_p in all_data:
    db_c = db_p['original_cost'] or 0
    db_name = db_p['project_name'] or ''
    for pdf_p in mapped_pdf:
        if abs(db_c - pdf_p['cost']) < 0.1 and pdf_p['name'] in db_name:
            updates.append({'id': db_p['id'], 'ministry': pdf_p['ministry']})
            matched_ids.add(db_p['id'])
            break

# Second pass: cost match only
for db_p in all_data:
    if db_p['id'] in matched_ids: continue
    db_c = db_p['original_cost'] or 0
    for pdf_p in mapped_pdf:
        if abs(db_c - pdf_p['cost']) < 0.1:
            updates.append({'id': db_p['id'], 'ministry': pdf_p['ministry']})
            matched_ids.add(db_p['id'])
            break

print(f'Matched {len(updates)} out of {len(all_data)}')

# Chunk updates
chunk_size = 100
for i in range(0, len(updates), chunk_size):
    chunk = updates[i:i+chunk_size]
    # Supabase bulk update doesn't exist natively for varied records, so we update one by one or upsert
    supabase.table('projects').upsert(chunk).execute()
    print(f'Updated {i+len(chunk)}')
