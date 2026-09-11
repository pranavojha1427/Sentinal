import pdfplumber, re, os, requests
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
headers = {'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY}

# Get all project codes currently in the DB
all_codes = set()
for offset in range(0, 3000, 1000):
    r = requests.get(SUPABASE_URL + '/rest/v1/projects?select=project_code&limit=1000&offset=' + str(offset), headers=headers)
    batch = r.json()
    for p in batch:
        if p.get('project_code'):
            all_codes.add(p['project_code'])
    if len(batch) < 1000:
        break
print("DB project codes count:", len(all_codes))

SL_MIN, SL_MAX, NAME_MAX = 55, 75, 460

# Find all sl rows in PDF and check their surrounding code
missing_projects = []

with pdfplumber.open('FlashReport_April2026.pdf') as pdf:
    for page_num in range(54, 162):
        page = pdf.pages[page_num]
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

        for i, row in enumerate(rows):
            row.sort(key=lambda w: w['x0'])
            sl = [w['text'] for w in row if SL_MIN <= w['x0'] < SL_MAX]
            sl_text = ' '.join(sl).strip()
            if not re.match(r'^\d+$', sl_text):
                continue
            
            line_text = ' '.join(w['text'] for w in row)
            if 'Total' in line_text:
                continue
            
            # Collect codes from this row and next 6 rows
            codes_nearby = set()
            for j in range(i, min(len(rows), i+7)):
                jr = rows[j]
                lt = ' '.join(w['text'] for w in jr)
                for m in re.finditer(r'\((\d{6,7})\)', lt):
                    codes_nearby.add(m.group(1))
            
            # Check if any nearby code is in the DB
            matched = [c for c in codes_nearby if c in all_codes]
            if not matched:
                # This sl row has no matching project in DB
                # Collect surrounding context
                context = []
                for j in range(i, min(len(rows), i+8)):
                    jr = rows[j]
                    lt = ' '.join(w['text'] for w in jr)
                    context.append(lt)
                missing_projects.append({
                    'sl': sl_text,
                    'page': page_num + 1,
                    'codes_nearby': list(codes_nearby),
                    'context': ' | '.join(context[:4])
                })

print("Projects in PDF NOT found in DB (sl numbers):", len(missing_projects))
for mp in missing_projects:
    print("  SL=%s page=%d codes=%s" % (mp['sl'], mp['page'], mp['codes_nearby']))
    print("    Context:", mp['context'][:200])
    print()
