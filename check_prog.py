import pdfplumber
pdf = pdfplumber.open('FlashReport_April2026.pdf')
page = pdf.pages[55]
words = page.extract_words()
for w in words:
    if w['x0'] > 930 and 'Page' not in w['text'] and 'Progress' not in w['text'] and '%' not in w['text']:
        print(f"{w['text']} ({w['top']:.1f})")
