import pdfplumber
import re
import json

def get_db_codes():
    with open(r'C:\Users\Pranav\.gemini\antigravity\brain\925a2b3c-a1a3-4fcc-8ccd-c339e409d7a9\.system_generated\steps\503\output.txt', 'r', encoding='utf-8') as f:
        text = f.read()
    return set(re.findall(r'\\?"project_code\\?":\\?"\(?(\d{6})\)?\\?"', text))

db_codes = get_db_codes()

pdf = pdfplumber.open('FlashReport_April2026.pdf')
pdf_codes = set()
for i in range(53, 162):
    page = pdf.pages[i]
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
        for j, w in enumerate(line):
            if re.match(r"^\(\d{6}\)$", w['text']):
                # To distinguish project codes from costs, check if it's the second word in a project row
                # Or check x0. Project codes usually have x0 between 80 and 300, whereas costs have x0 > 750
                if w['x0'] < 300:
                    pdf_codes.add(w['text'].strip("()"))

missing = pdf_codes - db_codes
print(f"Valid project codes in PDF: {len(pdf_codes)}")
print(f"Missing from DB: {len(missing)}")
if missing:
    for code in sorted(list(missing)):
        print(code)
