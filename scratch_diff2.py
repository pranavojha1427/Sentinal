import pdfplumber
import re
import json

def get_db_codes():
    with open(r'C:\Users\Pranav\.gemini\antigravity\brain\925a2b3c-a1a3-4fcc-8ccd-c339e409d7a9\.system_generated\steps\470\output.txt', 'r', encoding='utf-8') as f:
        text = f.read()
        match = re.search(r'<untrusted-data[^>]*>(.*?)</untrusted-data', text, re.DOTALL)
        if match:
            data = json.loads(match.group(1).strip())
            return set(item['project_code'] for item in data)
    return set()

def get_pdf_codes():
    pdf = pdfplumber.open('FlashReport_April2026.pdf')
    codes = set()
    for i in range(53, 162):
        for w in pdf.pages[i].extract_words():
            if re.match(r"^\(\d{6}\)$", w['text']):
                codes.add(w['text'].strip("()"))
    return codes

db_codes = get_db_codes()
pdf_codes = get_pdf_codes()

missing = pdf_codes - db_codes
print(f"Total in PDF: {len(pdf_codes)}")
print(f"Total in DB: {len(db_codes)}")
print(f"Missing from DB: {len(missing)}")
for code in sorted(list(missing)):
    print(code)
