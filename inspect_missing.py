import pdfplumber, re, os, requests
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
headers_base = {'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY}

SL_MIN, SL_MAX, NAME_MAX = 55, 75, 460
STATE_MAX = 570
DATES_MAX = 750
COST_MAX  = 855
CUM_MAX   = 950

VALID_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Andaman and Nicobar", "Chandigarh",
    "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Lakshadweep",
    "Puducherry", "Jammu and Kashmir", "Ladakh"
]

def bkt(x0):
    if SL_MIN <= x0 < SL_MAX: return 'sl'
    elif x0 < NAME_MAX: return 'name'
    elif x0 < STATE_MAX: return 'state'
    elif x0 < DATES_MAX: return 'dates'
    elif x0 < COST_MAX: return 'cost'
    elif x0 < CUM_MAX: return 'cum'
    else: return 'phys'

def parse_states(raw):
    inside = re.findall(r'\(([^)]+)\)', raw)
    search = ' , '.join(inside) if inside else raw
    found, seen = [], set()
    for st in VALID_STATES:
        if st in search and st not in seen:
            found.append(st); seen.add(st)
    if not found:
        for st in VALID_STATES:
            if st in raw and st not in seen:
                found.append(st); seen.add(st)
    return ', '.join(found) if found else 'Delhi'

def clean_num(val):
    if not val: return 0.0
    val = re.sub(r'[,()\u20b9%]', '', val).replace('Cr','').strip()
    if not val or val == '-': return 0.0
    try: return float(val)
    except: return 0.0

def clamp(v): return max(-999999.99, min(v, 999999.99))

# Target missing sl numbers and their pages (0-indexed)
TARGETS = {
    (74, 418): 'SL_418',    # page index 74 = PDF page 75
    (158, 1924): 'SL_1924', # page index 158 = PDF page 159
    (158, 1925): 'SL_1925',
}

missing_recs = []

with pdfplumber.open('FlashReport_April2026.pdf') as pdf:
    for (page_idx, target_sl), label in TARGETS.items():
        page = pdf.pages[page_idx]
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
            if sl_text != str(target_sl):
                continue
            
            print(f'\n=== {label} (page {page_idx+1}) ===')
            # Show this row and next 10 rows
            for j in range(max(0, i-3), min(len(rows), i+12)):
                jr = rows[j]
                jr.sort(key=lambda w: w['x0'])
                lt = ' '.join(w['text'] for w in jr)
                print(f'  Row {j}: {lt}')
                for w in jr:
                    print('    x0=%.1f  text=%r  bucket=%s' % (w['x0'], w['text'], bkt(w['x0'])))

print('\nDone.')
