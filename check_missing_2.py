import pdfplumber
import re

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
        for w in line:
            if re.match(r"^\(\d{6}\)$", w['text']) and w['x0'] < 300:
                pdf_codes.add(w['text'].strip("()"))

def get_test2_codes():
    import test_extract2
    all_p = test_extract2.extract_all()
    return set([p['project_code'] for p in all_p])

test2_codes = get_test2_codes()
missing = pdf_codes - test2_codes
print("Missing from test2:", missing)
