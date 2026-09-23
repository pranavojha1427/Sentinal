import pdfplumber
import re
import psycopg2

def get_db_codes():
    conn = psycopg2.connect("postgresql://postgres:[SentinalForce@1427]@db.ygbtrapskuguoagegftn.supabase.co:5432/postgres")
    cur = conn.cursor()
    cur.execute("SELECT project_code FROM projects")
    codes = [r[0] for r in cur.fetchall()]
    conn.close()
    return set(codes)

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
print(f"First 10 missing: {list(missing)[:10]}")
