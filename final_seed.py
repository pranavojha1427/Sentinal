import pdfplumber
import re
import os
import requests
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# ── All 36 valid States/UTs ─────────────────────────────────────────────────
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

MOSPI_SECTORS = [
    "Aviation & Aviation Infrastructure", "Coal", "Waste & Water",
    "Water Resources", "Inland Waterways", "Construction",
    "Roads & Highways", "Roads and Highways", "Metals & Mining",
    "Energy Storage", "Health and Family Welfare", "Healthcare", "Railways",
    "Education", "Telecommunication", "Urban Public Transport",
    "Urban Development", "Power", "Atomic Energy", "Electricity Generation",
    "Transmission & Distribution", "Petroleum", "Oil & Gas"
]

SECTOR_NORMALISE = {
    "Roads and Highways": "Roads & Highways",
    "Health and Family Welfare": "Healthcare",
    "Petroleum": "Oil & Gas",
    "Power": "Electricity Generation",
    "Atomic Energy": "Electricity Generation",
}

# ── Calibrated x0 column boundaries (from PDF word inspection) ──────────────
# Row type A (dates/cost row):    dates≈585-675, orig_cost≈775-800
# Row type B (sl_no row):         sl≈63.5, state≈479-530, cum≈865, phys≈966-970
# Row type C (revised cost row):  rev_cost in parens ≈775-780
#
# Boundaries used for bucketing:
SL_MIN   = 55    # serial number
SL_MAX   = 75
NAME_MAX = 460   # project name / agency / codes
STATE_MIN = 460  # state names on sl_no row
STATE_MAX = 570
DATES_MIN = 570  # start/revised dates
DATES_MAX = 750
COST_MIN  = 750  # original cost (plain number) AND revised cost (in parens)
COST_MAX  = 850
CUM_MIN   = 850  # cumulative expenditure
CUM_MAX   = 950
PHYS_MIN  = 950  # physical progress


def clean_num(val: str) -> float:
    if not val:
        return 0.0
    val = val.replace(",", "").replace("(", "").replace(")", "")
    val = val.replace("\u20b9", "").replace("Cr", "").replace("%", "").strip()
    if val in ("-", ""):
        return 0.0
    try:
        return float(val)
    except ValueError:
        return 0.0


def clamp(v: float) -> float:
    return max(-999_999.99, min(v, 999_999.99))


def parse_states(raw: str) -> str:
    """Parse all state names from a raw state string including Multi-State formats."""
    # First try content inside parentheses
    inside = re.findall(r'\(([^)]+)\)', raw)
    search_text = " , ".join(inside) if inside else raw

    found = []
    seen = set()
    for st in VALID_STATES:
        if st in search_text and st not in seen:
            found.append(st)
            seen.add(st)

    if not found:
        for st in VALID_STATES:
            if st in raw and st not in seen:
                found.append(st)
                seen.add(st)

    return ", ".join(found) if found else ""


def bucket(x0: float) -> str:
    if SL_MIN <= x0 < SL_MAX:
        return "sl"
    elif x0 < NAME_MAX:
        return "name"
    elif STATE_MIN <= x0 < STATE_MAX:
        return "state"
    elif DATES_MIN <= x0 < DATES_MAX:
        return "dates"
    elif COST_MIN <= x0 < COST_MAX:
        return "cost"
    elif CUM_MIN <= x0 < CUM_MAX:
        return "cum"
    elif x0 >= PHYS_MIN:
        return "phys"
    else:
        return "name"  # catch-all


def extract_all():
    projects = []
    current_proj = None
    current_sector = "Others"

    with pdfplumber.open("FlashReport_April2026.pdf") as pdf:
        for page_num in range(54, 162):
            page = pdf.pages[page_num]

            # Build visual rows
            rows = []
            cur_row = []
            last_top = -1
            for w in page.extract_words(x_tolerance=2, y_tolerance=2):
                if last_top == -1 or abs(w["top"] - last_top) > 4:
                    if cur_row:
                        rows.append(cur_row)
                    cur_row = []
                    last_top = w["top"]
                cur_row.append(w)
            if cur_row:
                rows.append(cur_row)

            for row in rows:
                row.sort(key=lambda w: w["x0"])
                if not row:
                    continue

                # Bucket into columns
                b = {"sl": [], "name": [], "state": [], "dates": [],
                     "cost": [], "cum": [], "phys": []}
                for w in row:
                    b[bucket(w["x0"])].append(w["text"])

                sl_text    = " ".join(b["sl"]).strip()
                name_text  = " ".join(b["name"]).strip()
                state_text = " ".join(b["state"]).strip()
                cost_text  = " ".join(b["cost"]).strip()
                cum_text   = " ".join(b["cum"]).strip()
                phys_text  = " ".join(b["phys"]).strip()
                line_text  = " ".join(w["text"] for w in row).strip()

                # ── Sector header ─────────────────────────────────────────
                lt = name_text.strip()
                if lt in MOSPI_SECTORS or lt.replace("and", "&") in MOSPI_SECTORS:
                    current_sector = SECTOR_NORMALISE.get(lt, lt)
                    continue

                # ── New project: row has a serial number ─────────────────
                if re.match(r"^\d+$", sl_text):
                    if "Total" in line_text:
                        continue

                    if current_proj and current_proj.get("project_code"):
                        projects.append(current_proj)

                    current_proj = {
                        "project_code": None,
                        "name_parts":   [name_text] if name_text else [],
                        "state_raw":    state_text,
                        # sl_no row carries cum_exp and phys_prog
                        "orig_parts":   [],          # filled by the dates-row above
                        "rev_parts":    [],           # filled by continuation row
                        "cum_parts":    [cum_text] if cum_text else [],
                        "phys_parts":   [phys_text] if phys_text else [],
                        "sector":       current_sector,
                        # Carry forward the cost that appeared on the PREVIOUS row (dates row)
                        "_pending_orig": None,
                        "_pending_rev":  None,
                    }
                    continue

                # ── Dates/cost row (appears BEFORE the sl_no row in PDF) ─
                # This is a row with dates and original cost but no sl number.
                # We'll track it as "pending" for the next project.
                if not sl_text and cost_text and not current_proj:
                    # Store as pending — will be consumed when sl row arrives
                    # We can't easily do this without look-ahead, so we handle
                    # it differently: when a new sl row arrives, we look at
                    # the PREVIOUS row's cost.
                    pass

                # ── Continuation row ──────────────────────────────────────
                if not current_proj:
                    continue

                # Project code: (6 digits)
                code_m = re.search(r'\((\d{6,7})\)', name_text)
                if code_m and not current_proj["project_code"]:
                    current_proj["project_code"] = code_m.group(1)

                if name_text:
                    current_proj["name_parts"].append(name_text)

                if state_text:
                    current_proj["state_raw"] += " " + state_text

                # Cost on this continuation row
                if cost_text:
                    tokens = cost_text.split()
                    for t in tokens:
                        if t.startswith("("):
                            current_proj["rev_parts"].append(t)
                        else:
                            current_proj["orig_parts"].append(t)

                if cum_text:
                    current_proj["cum_parts"].append(cum_text)
                if phys_text:
                    current_proj["phys_parts"].append(phys_text)

        if current_proj and current_proj.get("project_code"):
            projects.append(current_proj)

    return projects


# ── Second pass: also capture original cost which appears on the DATES row ──
# The dates row is the row immediately before the sl_no row.
# Strategy: Do a two-pass extraction. Pass 1 builds all rows per page.
# Pass 2 processes them in sequence so we can look back one row.

def extract_all_v2():
    """
    Two-pass spatial extraction.
    Pass 1: Build all page rows.
    Pass 2: Walk rows in sequence, look-ahead/back for cost on dates row.
    """
    projects = []
    current_proj = None
    current_sector = "Others"
    prev_cost_text = ""   # cost seen on the row immediately before a new sl row

    with pdfplumber.open("FlashReport_April2026.pdf") as pdf:
        for page_num in range(54, 162):
            page = pdf.pages[page_num]

            rows = []
            cur_row = []
            last_top = -1
            for w in page.extract_words(x_tolerance=2, y_tolerance=2):
                if last_top == -1 or abs(w["top"] - last_top) > 4:
                    if cur_row:
                        rows.append(cur_row)
                    cur_row = []
                    last_top = w["top"]
                cur_row.append(w)
            if cur_row:
                rows.append(cur_row)

            for row in rows:
                row.sort(key=lambda w: w["x0"])
                if not row:
                    continue

                b = {"sl": [], "name": [], "state": [], "dates": [],
                     "cost": [], "cum": [], "phys": []}
                for w in row:
                    b[bucket(w["x0"])].append(w["text"])

                sl_text    = " ".join(b["sl"]).strip()
                name_text  = " ".join(b["name"]).strip()
                state_text = " ".join(b["state"]).strip()
                cost_text  = " ".join(b["cost"]).strip()
                cum_text   = " ".join(b["cum"]).strip()
                phys_text  = " ".join(b["phys"]).strip()
                line_text  = " ".join(w["text"] for w in row)

                # Sector header
                lt = name_text.strip()
                if lt in MOSPI_SECTORS or lt.replace("and", "&") in MOSPI_SECTORS:
                    current_sector = SECTOR_NORMALISE.get(lt, lt)
                    prev_cost_text = ""
                    continue

                # Track cost from previous row (dates row carries original cost)
                if not re.match(r"^\d+$", sl_text) and cost_text:
                    prev_cost_text = cost_text

                # New project row
                if re.match(r"^\d+$", sl_text):
                    if "Total" in line_text:
                        prev_cost_text = ""
                        continue

                    if current_proj and current_proj.get("project_code"):
                        projects.append(current_proj)

                    current_proj = {
                        "project_code": None,
                        "name_parts":   [name_text] if name_text else [],
                        "state_raw":    state_text,
                        "orig_parts":   [],
                        "rev_parts":    [],
                        "cum_parts":    [cum_text] if cum_text else [],
                        "phys_parts":   [phys_text] if phys_text else [],
                        "sector":       current_sector,
                    }

                    # The original cost was on the previous (dates) row
                    if prev_cost_text:
                        for t in prev_cost_text.split():
                            if not t.startswith("("):
                                current_proj["orig_parts"].append(t)
                    prev_cost_text = ""
                    continue

                if not current_proj:
                    continue

                # Project code
                code_m = re.search(r'\((\d{6,7})\)', name_text)
                if code_m and not current_proj["project_code"]:
                    current_proj["project_code"] = code_m.group(1)

                if name_text:
                    current_proj["name_parts"].append(name_text)

                if state_text:
                    current_proj["state_raw"] += " " + state_text

                # Revised cost in parens
                if cost_text:
                    for t in cost_text.split():
                        if t.startswith("("):
                            current_proj["rev_parts"].append(t)
                        else:
                            current_proj["orig_parts"].append(t)

                if cum_text:
                    current_proj["cum_parts"].append(cum_text)
                if phys_text:
                    current_proj["phys_parts"].append(phys_text)

        if current_proj and current_proj.get("project_code"):
            projects.append(current_proj)

    return projects


FOOTER_RE = re.compile(
    r"Project Assessment.+?Sl\.No|"
    r"Ministry of Petroleum.+?Gas|"
    r"Ministry of Ports.+?Waterways|"
    r"All Ongoing Projects.+?MM/YYYY",
    re.DOTALL
)


def build_final(raw_projects):
    final = []
    for p in raw_projects:
        name = " ".join(p["name_parts"]).strip()
        name = FOOTER_RE.sub("", name).strip()
        name = re.sub(r"\(\d{6,7}\)", "", name).strip()
        name = re.sub(r"\s{2,}", " ", name)
        name = name[:255]

        matched_state = parse_states(p["state_raw"])
        if not matched_state:
            matched_state = "Delhi"

        # Original cost: first non-paren token from orig_parts
        orig_tokens = []
        for part in p["orig_parts"]:
            orig_tokens.extend(part.split())
        orig_raw = next((t for t in orig_tokens if not t.startswith("(")), "")
        orig = clamp(clean_num(orig_raw))

        # Revised cost: first paren token from rev_parts
        rev_tokens = []
        for part in p["rev_parts"]:
            rev_tokens.extend(part.split())
        rev_raw = next((t for t in rev_tokens if t.startswith("(")), orig_raw)
        rev = clamp(clean_num(rev_raw))

        if orig > 0:
            overrun = ((rev - orig) / orig) * 100
            if overrun > 999_999 or overrun < -999_999:
                orig = 0

        cum_tokens = " ".join(p["cum_parts"]).split()
        phys_tokens = " ".join(p["phys_parts"]).split()
        exp  = clamp(clean_num(cum_tokens[0] if cum_tokens else ""))
        prog = clamp(clean_num(phys_tokens[0] if phys_tokens else ""))

        sector = SECTOR_NORMALISE.get(p["sector"], p["sector"]) or "Others"

        final.append({
            "project_code":          p["project_code"],
            "project_name":          name if name else "Unknown Project",
            "agency":                "Unknown Agency",
            "state":                 matched_state,
            "original_cost":         orig,
            "revised_cost":          rev,
            "cumulative_expenditure": exp,
            "physical_progress":     prog,
            "sector":                sector,
            "hml_category":          "Others",
        })
    return final


# ── MAIN ────────────────────────────────────────────────────────────────────
print("Extracting projects from PDF (v2 two-pass)...")
raw = extract_all_v2()
print("Raw records found:", len(raw))

final_projects = build_final(raw)
print("Total to seed:", len(final_projects))

# Cost sanity check
with_cost = [p for p in final_projects if p["original_cost"] > 0]
print("Projects with original_cost > 0:", len(with_cost))

# State diagnostic
state_counts = {}
for p in final_projects:
    for st in p["state"].split(","):
        st = st.strip()
        if st:
            state_counts[st] = state_counts.get(st, 0) + 1
print("\nState counts:")
for st, cnt in sorted(state_counts.items(), key=lambda x: -x[1]):
    print("  %s: %d" % (st, cnt))

# ── Seed ─────────────────────────────────────────────────────────────────────
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=minimal, resolution=merge-duplicates"
}
url = SUPABASE_URL + "/rest/v1/projects?on_conflict=project_code"

print("\nTruncating table...")
requests.delete(
    SUPABASE_URL + "/rest/v1/projects?project_code=not.is.null",
    headers=headers
)

chunk_size = 200
errors = 0
for i in range(0, len(final_projects), chunk_size):
    chunk = final_projects[i: i + chunk_size]
    resp = requests.post(url, headers=headers, json=chunk)
    if resp.status_code not in (200, 201, 204):
        errors += 1
        print("  Failed chunk %d: %d %s" % (i, resp.status_code, resp.text[:200]))

print("Seeding complete. Errors:", errors)
