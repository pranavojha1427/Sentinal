import pdfplumber
import re
import os
import requests
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

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

# ── Calibrated x0 column boundaries from PDF word inspection ──────────────
# sl_no   : 55 ≤ x0 < 75      e.g. "681" at x0=57.9
# name    : x0 < 460           project name/agency/codes at x0=86
# state   : 460 ≤ x0 < 570    state column at x0=473-530
# dates   : 570 ≤ x0 < 750    dates at x0=582-680
# cost    : 750 ≤ x0 < 855    original cost at x0=778-781, revised at x0=772-780
# cum_exp : 855 ≤ x0 < 950    cumulative expenditure at x0=862-865
# phys    : x0 ≥ 950          physical progress at x0=963-970

SL_MIN   = 55
SL_MAX   = 75
NAME_MAX = 460
STATE_MAX = 570
DATES_MAX = 750
COST_MAX  = 855
CUM_MAX   = 950


def clean_num(val: str) -> float:
    if not val:
        return 0.0
    val = re.sub(r'[,()\u20b9%]', '', val).replace('Cr', '').strip()
    if not val or val == '-':
        return 0.0
    try:
        return float(val)
    except ValueError:
        return 0.0


def clamp(v: float) -> float:
    return max(-999_999.99, min(v, 999_999.99))


def parse_states(raw: str) -> str:
    """Extract all valid state names from a raw multi-state string."""
    # Try content inside parentheses first
    inside = re.findall(r'\(([^)]+)\)', raw)
    search_text = " , ".join(inside) if inside else raw

    found, seen = [], set()
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
    elif x0 < STATE_MAX:
        return "state"
    elif x0 < DATES_MAX:
        return "dates"
    elif x0 < COST_MAX:
        return "cost"
    elif x0 < CUM_MAX:
        return "cum"
    else:
        return "phys"


def extract_all():
    projects = []
    current_proj = None
    current_sector = "Others"
    prev_orig_cost = ""   # original cost from the DATES row before a sl row

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

                # ── Sector header ─────────────────────────────────────────
                lt = name_text.strip()
                if lt in MOSPI_SECTORS or lt.replace("and", "&") in MOSPI_SECTORS:
                    current_sector = SECTOR_NORMALISE.get(lt, lt)
                    prev_orig_cost = ""
                    continue

                # ── Skip Ministry / header / footer rows ──────────────────
                if lt.startswith("Ministry of") or "PAIMANA" in line_text or "Page" in line_text:
                    continue

                # ── Skip Total rows (sector summaries) ────────────────────
                # Total rows appear as continuation lines with "Total (" in name column
                if re.match(r'^Total\s*\(', lt):
                    # Do NOT accumulate any costs from Total rows
                    continue

                # ── Track prev_orig_cost from dates+cost rows ─────────────
                # These are rows with dates & original cost but NO sl number.
                # Original cost = non-parenthesised number in cost column.
                if not re.match(r"^\d+$", sl_text) and cost_text:
                    orig_tokens = [t for t in cost_text.split() if not t.startswith("(")]
                    if orig_tokens:
                        prev_orig_cost = orig_tokens[0]
                    # Note: parenthesised cost on non-sl rows is a revised cost
                    # for the CURRENT project (not prev_orig_cost)
                    rev_tokens = [t for t in cost_text.split() if t.startswith("(")]
                    if rev_tokens and current_proj:
                        current_proj["rev_parts"].extend(rev_tokens)

                # ── New project row: sl number present ────────────────────
                if re.match(r"^\d+$", sl_text):
                    if "Total" in line_text:
                        prev_orig_cost = ""
                        continue

                    if current_proj and current_proj.get("project_code"):
                        projects.append(current_proj)

                    # Project code MAY be on the sl_no row itself (e.g. 681 (705237))
                    # Also accept 4-5 digit codes like (9265) for projects with no standard code
                    code_on_sl = None
                    code_m = re.search(r'\((\d{4,7})\)', name_text)
                    if code_m:
                        code_on_sl = code_m.group(1)

                    # Use sl_number as unique fallback project_code (prefix SL_ to avoid collisions)
                    if not code_on_sl:
                        code_on_sl = "SL_" + sl_text

                    current_proj = {
                        "project_code": code_on_sl,
                        "project_code_pending": code_on_sl.startswith("SL_"),  # will be updated if real code found later
                        "name_parts":   [name_text] if name_text else [],
                        "state_raw":    state_text,
                        "orig_parts":   [prev_orig_cost] if prev_orig_cost else [],
                        "rev_parts":    [],
                        "cum_parts":    [cum_text] if cum_text else [],
                        "phys_parts":   [phys_text] if phys_text else [],
                        "sector":       current_sector,
                    }
                    prev_orig_cost = ""
                    continue

                # ── Continuation rows ─────────────────────────────────────
                if not current_proj:
                    continue

                # Project code from continuation rows — prefer real 4-7 digit codes over SL_ fallback
                code_m = re.search(r'\((\d{4,7})\)', name_text)
                if code_m:
                    real_code = code_m.group(1)
                    # Only update if we still have the SL_ fallback or haven't set code yet
                    if current_proj.get("project_code_pending"):
                        current_proj["project_code"] = real_code
                        current_proj["project_code_pending"] = False

                if name_text:
                    current_proj["name_parts"].append(name_text)

                if state_text:
                    current_proj["state_raw"] += " " + state_text

                # Accumulate revised cost only (original cost came from prev_orig_cost)
                if cost_text:
                    for t in cost_text.split():
                        if t.startswith("("):
                            current_proj["rev_parts"].append(t)
                        # Non-paren values here are additional orig cost (edge cases)
                        else:
                            if not current_proj["orig_parts"]:
                                current_proj["orig_parts"].append(t)

                if cum_text and not current_proj["cum_parts"]:
                    current_proj["cum_parts"].append(cum_text)
                if phys_text and not current_proj["phys_parts"]:
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
        name = re.sub(r"\(\d{4,7}\)", "", name).strip()   # remove all numeric code tokens
        name = re.sub(r"\s{2,}", " ", name)
        name = name[:255]

        matched_state = parse_states(p["state_raw"])
        if not matched_state:
            matched_state = "Delhi"

        # Original cost: first non-paren value from orig_parts
        orig_tokens = []
        for part in p["orig_parts"]:
            orig_tokens.extend(part.split())
        orig_raw = next((t for t in orig_tokens if not t.startswith("(")), "")
        orig = clamp(clean_num(orig_raw))

        # Revised cost: first paren value from rev_parts; default to orig if none
        rev_tokens = []
        for part in p["rev_parts"]:
            rev_tokens.extend(part.split())
        rev_raw = next((t for t in rev_tokens if t.startswith("(")), "")
        rev = clamp(clean_num(rev_raw)) if rev_raw else orig

        # Guard overflow
        if orig > 0:
            overrun = ((rev - orig) / orig) * 100
            if overrun > 999_999 or overrun < -999_999:
                orig = 0

        cum_tokens  = " ".join(p["cum_parts"]).split()
        phys_tokens = " ".join(p["phys_parts"]).split()
        exp  = clamp(clean_num(cum_tokens[0]  if cum_tokens  else ""))
        prog = clamp(clean_num(phys_tokens[0] if phys_tokens else ""))

        sector = SECTOR_NORMALISE.get(p["sector"], p["sector"]) or "Others"

        final.append({
            "project_code":           p["project_code"],
            "project_name":           name if name else "Unknown Project",
            "agency":                 "Unknown Agency",
            "state":                  matched_state,
            "original_cost":          orig,
            "revised_cost":           rev,
            "cumulative_expenditure": exp,
            "physical_progress":      prog,
            "sector":                 sector,
            "hml_category":           "Others",
        })
    return final


# ── MAIN ────────────────────────────────────────────────────────────────────
print("Extracting projects from PDF...")
raw = extract_all()
print("Raw project records found:", len(raw))

final_projects = build_final(raw)
print("Total to seed:", len(final_projects))

# Cost sanity check
with_cost = [p for p in final_projects if p["original_cost"] > 0]
print("Projects with original_cost > 0:", len(with_cost))

total_orig = sum(p["original_cost"] for p in final_projects)
total_rev  = sum(p["revised_cost"]  for p in final_projects)
total_exp  = sum(p["cumulative_expenditure"] for p in final_projects)
print("Computed Original Cost: %.2f cr" % total_orig)
print("Computed Revised Cost:  %.2f cr" % total_rev)
print("Computed Expenditure:   %.2f cr" % total_exp)

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

# Suspicious large costs
print("\nProjects with original_cost > 5000:")
big = sorted([p for p in final_projects if p["original_cost"] > 5000], key=lambda x: -x["original_cost"])
for p in big[:10]:
    print("  code=%-10s orig=%-10.2f rev=%-10.2f | %s" % (
        p["project_code"], p["original_cost"], p["revised_cost"], p["project_name"][:70]))

# ── Seed ─────────────────────────────────────────────────────────────────────
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=minimal, resolution=merge-duplicates"
}
url = SUPABASE_URL + "/rest/v1/projects?on_conflict=project_code"

print("\nTruncating table (all rows)...")
# Delete non-null project codes
requests.delete(
    SUPABASE_URL + "/rest/v1/projects?project_code=not.is.null",
    headers=headers
)
# Also delete null project code rows
requests.delete(
    SUPABASE_URL + "/rest/v1/projects?project_code=is.null",
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
