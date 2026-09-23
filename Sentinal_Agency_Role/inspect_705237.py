import pdfplumber, re

# Inspect exact word positions around project 705237 (Western DFC) on page 87 (index 86)
with pdfplumber.open('FlashReport_April2026.pdf') as pdf:
    page = pdf.pages[86]
    rows = []
    cur_row = []
    last_top = -1
    for w in page.extract_words(x_tolerance=2, y_tolerance=2):
        if last_top == -1 or abs(w['top'] - last_top) > 4:
            if cur_row:
                rows.append(cur_row)
            cur_row = []
            last_top = w['top']
        cur_row.append(w)
    if cur_row:
        rows.append(cur_row)

    # Find row with '681' or '705237'
    for i, row in enumerate(rows):
        row_text = ' '.join(w['text'] for w in row)
        if '705237' in row_text or ('681' in row_text and 'Maharashtra' in row_text):
            print(f'--- Row {i} (target area) ---')
            for j in range(max(0,i-8), min(len(rows), i+10)):
                rrow = rows[j]
                rrow.sort(key=lambda w: w['x0'])
                print(f'  Row {j}:')
                for w in rrow:
                    print('    x0=%.1f  text=%r' % (w['x0'], w['text']))
            break
