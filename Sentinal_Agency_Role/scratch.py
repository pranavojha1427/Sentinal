import pdfplumber
import re

pdf = pdfplumber.open('FlashReport_April2026.pdf')
sl_no_x0s = []
project_codes = []

for i in range(53, 162):
    page = pdf.pages[i]
    words = page.extract_words()
    
    # group by lines
    lines = []
    current_line = []
    last_top = -1
    for w in words:
        if last_top == -1 or abs(w['top'] - last_top) > 4:
            if current_line:
                lines.append(current_line)
            current_line = []
            last_top = w['top']
        current_line.append(w)
    if current_line:
        lines.append(current_line)
        
    for line in lines:
        first_word = line[0]
        if re.match(r"^\d+$", first_word['text']):
            sl_no_x0s.append(first_word['x0'])
        
        # also count project codes like (612786)
        for w in line:
            if re.match(r"^\(\d{6}\)$", w['text']):
                project_codes.append(w['text'])

print(f"Total sl_no words at start of line: {len(sl_no_x0s)}")
print(f"Max x0 for sl_no: {max(sl_no_x0s) if sl_no_x0s else 'None'}")
print(f"Total unique project codes: {len(set(project_codes))}")
