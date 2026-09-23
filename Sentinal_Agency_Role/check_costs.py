import pdfplumber

# Check the exact PDF values for the known large projects
# to determine if they are genuinely that large or incorrectly extracted

targets = {
    '705237': 'Dahod-Indore (code 705237)',
    '705728': 'Delhi-Mumbai speed (code 705728)',
    '702668': 'Lucknow Metro 1B (code 702668)',
}

with pdfplumber.open('FlashReport_April2026.pdf') as pdf:
    for page_num in range(54, 162):
        page = pdf.pages[page_num]
        text = page.extract_text() or ''
        for code, label in targets.items():
            if code in text:
                print(f'\n=== Found {label} on page {page_num+1} ===')
                # Get surrounding lines
                lines = text.split('\n')
                for i, line in enumerate(lines):
                    if code in line:
                        start = max(0, i-5)
                        end = min(len(lines), i+6)
                        for j in range(start, end):
                            print(f'  {lines[j]}')
                        break
