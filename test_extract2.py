import pdfplumber
import re

def extract_all():
    pdf = pdfplumber.open('FlashReport_April2026.pdf')
    projects = []
    current_proj = None
    
    for page_num in range(53, 162):
        page = pdf.pages[page_num]
        
        # Group words by lines
        lines = []
        current_line = []
        last_top = -1
        for w in page.extract_words():
            if last_top == -1 or abs(w['top'] - last_top) > 4:
                if current_line:
                    lines.append(current_line)
                current_line = []
                last_top = w['top']
            current_line.append(w)
        if current_line:
            lines.append(current_line)
            
        for line in lines:
            line = sorted(line, key=lambda w: w['x0'])
            if not line: continue
            
            first_word = line[0]['text'].strip()
            
            # Start of a new project
            if re.match(r"^\d+$", first_word) and line[0]['x0'] < 100:
                # ignore 'Total (' lines
                is_total = False
                for w in line:
                    if w['text'].startswith("Total"):
                        is_total = True
                if is_total: continue
                
                if current_proj and current_proj.get("project_code"):
                    projects.append(current_proj)
                current_proj = {
                    "project_code": None,
                    "project_name": [],
                    "state": [],
                    "cost": [],
                    "cum_exp": [],
                    "phys_prog": [],
                    "agency": "Unknown Agency"
                }
            
            if not current_proj:
                continue
                
            for w in line:
                x0 = w['x0']
                txt = w['text']
                
                # Check for project code
                if re.match(r"^\(\d{6}\)$", txt) and x0 < 300:
                    current_proj["project_code"] = txt.strip("()")
                    continue # don't add to main text
                    
                # Assign to columns
                if x0 < 100 and re.match(r"^\d+$", txt):
                    pass # sl_no
                elif x0 < 470:
                    current_proj["project_name"].append(txt)
                elif x0 < 550:
                    current_proj["state"].append(txt)
                elif x0 < 750:
                    pass # dates
                elif x0 < 840:
                    current_proj["cost"].append(txt)
                elif x0 < 930:
                    current_proj["cum_exp"].append(txt)
                else:
                    current_proj["phys_prog"].append(txt)

    if current_proj and current_proj.get("project_code"):
        projects.append(current_proj)
        
    return projects

all_p = extract_all()
print(f"Extracted {len(all_p)} project blocks with codes.")
unique = set([p['project_code'] for p in all_p])
print(f"Unique project codes: {len(unique)}")
