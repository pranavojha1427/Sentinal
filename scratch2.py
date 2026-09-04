import pdfplumber
pdf = pdfplumber.open('FlashReport_April2026.pdf')
for w in pdf.pages[53].extract_words():
    if 75 < w['x0'] < 150:
        print(f"{w['text']} at {w['x0']}")
