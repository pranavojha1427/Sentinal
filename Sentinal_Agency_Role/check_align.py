import pdfplumber
import re

def check_anomalies():
    pdf = pdfplumber.open('FlashReport_April2026.pdf')
    for page_num in range(53, 56):
        page = pdf.pages[page_num]
        
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
            
            # Print words ending near 930
            end_words = [w for w in line if w['x0'] > 800]
            if end_words:
                print([f"{w['text']} ({w['x0']:.1f})" for w in end_words])

check_anomalies()
