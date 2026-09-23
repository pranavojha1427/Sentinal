import pdfplumber
import os
import re
import requests
import time

def get_col(x0):
    if x0 < 80: return 'sl_no'
    elif x0 < 470: return 'main'
    elif x0 < 550: return 'state'
    elif x0 < 750: return 'dates'
    elif x0 < 840: return 'cost'
    elif x0 < 930: return 'cum_exp'
    else: return 'phys_prog'

def clean_num(val):
    if not val: return None
    val = val.replace(',', '').replace('(', '').replace(')', '').strip()
    if val == '-' or not val: return None
    try:
        return float(val)
    except:
        return None

def extract_projects(pdf_path, start_page, end_page):
    projects = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num in range(start_page, min(end_page, len(pdf.pages))):
            page = pdf.pages[page_num]
            # 1. Update pdfplumber table extraction settings as requested
            table = page.extract_table({"vertical_strategy": "text", "horizontal_strategy": "text"})
            if not table: continue
            
            for row in table:
                row_text = [str(c).replace('\n', ' ').strip() if c else "" for c in row]
                if len(row_text) < 7: continue
                
                # Assuming standard table layout based on the extraction
                sl_no_text = row_text[0]
                main_text = row_text[1]
                state_text = row_text[2]
                cost_text = row_text[4]
                cum_text = row_text[5]
                phys_text = row_text[6]
                
                if not re.match(r"^\d+$", sl_no_text.strip()):
                    continue
                    
                # 2. Normalize the State Data
                # Parse 'Multi-States (Madhya Pradesh, Maharashtra)' into an array string
                if 'Multi-State' in state_text or '(' in state_text:
                    match = re.search(r'\((.*?)\)', state_text)
                    if match:
                        states = [s.strip() for s in match.group(1).split(',')]
                        state_text = ", ".join(states)
                
                projects.append({
                    "project_code": "UNKNOWN",
                    "project_name": main_text,
                    "agency": "Unknown",
                    "state": state_text,
                    "original_cost": clean_num(cost_text),
                    "revised_cost": None,
                    "cumulative_expenditure": clean_num(cum_text),
                    "physical_progress": clean_num(phys_text)
                })

    return projects

def seed_db():
    print("Extracting projects...")
    # Table 6 starts at page 54 (index 53) and actually goes up to page 162
    projects = extract_projects("FlashReport_April2026.pdf", 53, 162)
    print(f"Extracted {len(projects)} projects.")
    
    url = "https://ygbtrapskuguoagegftn.supabase.co/rest/v1/projects"
    headers = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYnRyYXBza3VndW9hZ2VnZnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTQ0NDYsImV4cCI6MjEwMzk5MDQ0Nn0.lcQ-_NTto0QTFHqf5J4z8waxvi_DLWEhNMRxUyacW6c",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYnRyYXBza3VndW9hZ2VnZnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTQ0NDYsImV4cCI6MjEwMzk5MDQ0Nn0.lcQ-_NTto0QTFHqf5J4z8waxvi_DLWEhNMRxUyacW6c",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    payload = []
    for p in projects:
        p_name = p['project_name'].strip()
        agency = p['agency'].strip("()[] ") if p['agency'] else "Unknown"
        
        orig_cost = p['original_cost'] if p['original_cost'] is not None else 0
        revised_cost = p['revised_cost'] if p['revised_cost'] is not None else orig_cost
        cum_exp = p['cumulative_expenditure'] if p['cumulative_expenditure'] is not None else 0
        
        payload.append({
            "project_code": p['project_code'] if p['project_code'] else "UNKNOWN",
            "project_name": p_name if p_name else "Unknown Project",
            "agency": agency,
            "sector": "Aviation",
            "hml_category": "Transport & Logistics",
            "state": p['state'] if p['state'] else "Unknown",
            "original_cost": orig_cost,
            "revised_cost": revised_cost,
            "cumulative_expenditure": cum_exp,
            "physical_progress": p['physical_progress']
        })
    
    # Batch inserts
    batch_size = 500
    for i in range(0, len(payload), batch_size):
        batch = payload[i:i+batch_size]
        response = requests.post(url, headers=headers, json=batch)
        if response.status_code in (200, 201):
            print(f"Batch {i//batch_size + 1} seeded successfully.")
        else:
            print(f"Error seeding batch {i//batch_size + 1}:", response.status_code, response.text)
        time.sleep(0.5)

if __name__ == "__main__":
    seed_db()
