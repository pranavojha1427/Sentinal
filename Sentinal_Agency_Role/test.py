import pdfplumber
import sys

with pdfplumber.open('FlashReport_May2026.pdf') as pdf:
    for p in pdf.pages:
        text = p.extract_text()
        if '705728' in text or '701346' in text or '705237' in text:
            print(f"Page {p.page_number}")
            words = p.extract_words(keep_blank_chars=False)
            for w in words:
                if '705728' in w['text'] or '701346' in w['text'] or '705237' in w['text']:
                    print("Found Project:", w['text'].encode('ascii', 'ignore').decode())
                    for w2 in words:
                        if abs(w2['top'] - w['top']) < 80:
                            if 700 <= w2['x0'] <= 900:
                                val = w2['text'].encode('ascii', 'ignore').decode()
                                print(f"  Cost/Exp area: {val} at x={w2['x0']:.1f}")
