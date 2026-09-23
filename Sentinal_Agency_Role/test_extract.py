import pdfplumber
import re
import json

def extract_projects_by_code(pdf_path, start_page, end_page):
    pdf = pdfplumber.open(pdf_path)
    projects = []
    
    current_proj = None
    
    for page_num in range(start_page, min(end_page, len(pdf.pages))):
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
            
        def get_col(x0):
            if x0 < 90: return 'sl_no'
            elif x0 < 470: return 'main'
            elif x0 < 550: return 'state'
            elif x0 < 750: return 'dates'
            elif x0 < 840: return 'cost'
            elif x0 < 930: return 'cum_exp'
            else: return 'phys_prog'
            
        for line in lines:
            cols = {
                'sl_no': [], 'main': [], 'state': [], 'dates': [],
                'cost': [], 'cum_exp': [], 'phys_prog': []
            }
            for w in line:
                cols[get_col(w['x0'])].append(w['text'])
            
            sl_no_text = " ".join(cols['sl_no'])
            main_text = " ".join(cols['main'])
            
            # Start of a new project? Check if sl_no_text is purely digits.
            if re.match(r"^\d+$", sl_no_text.strip()):
                if main_text.startswith("Total ("):
                    continue
                if current_proj:
                    projects.append(current_proj)
                current_proj = {
                    "project_code": None,
                    "project_name": [],
                    "state": [],
                    "cost": [],
                    "cum_exp": [],
                    "phys_prog": []
                }
            
            # If no project started yet (e.g. top of page before first project), skip
            if not current_proj:
                continue
                
            # Is the project code on this line?
            for w in line:
                if re.match(r"^\(\d{6}\)$", w['text']) and w['x0'] < 300:
                    current_proj["project_code"] = w['text'].strip("()")
                    # the project code should not be part of the name
                    main_text = main_text.replace(w['text'], '').strip()

            if main_text: current_proj["project_name"].append(main_text)
            if cols['state']: current_proj["state"].append(" ".join(cols['state']))
            if cols['cost']: current_proj["cost"].append(" ".join(cols['cost']))
            if cols['cum_exp']: current_proj["cum_exp"].append(" ".join(cols['cum_exp']))
            if cols['phys_prog']: current_proj["phys_prog"].append(" ".join(cols['phys_prog']))

    if current_proj:
        projects.append(current_proj)
        
    return projects

all_p = extract_projects_by_code('FlashReport_April2026.pdf', 53, 162)
valid = [p for p in all_p if p.get('project_code')]
print(f"Extracted {len(all_p)} total project blocks.")
print(f"Of those, {len(valid)} had project codes.")

codes = [p['project_code'] for p in valid]
unique = set(codes)
print(f"Unique project codes: {len(unique)}")
