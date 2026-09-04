import re
import json

with open(r'C:\Users\Pranav\.gemini\antigravity\brain\925a2b3c-a1a3-4fcc-8ccd-c339e409d7a9\.system_generated\steps\503\output.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# match both raw quotes and escaped quotes
db_codes = set(re.findall(r'\\?"project_code\\?":\\?"\(?(\d{6})\)?\\?"', text))

with open('pdf_codes.txt', 'r') as f:
    pdf_codes = set(f.read().splitlines())

missing = pdf_codes - db_codes
print(f'DB codes count: {len(db_codes)}')
print(f'Missing codes count: {len(missing)}')
with open('really_missing.json', 'w') as f:
    json.dump(sorted(list(missing)), f)
