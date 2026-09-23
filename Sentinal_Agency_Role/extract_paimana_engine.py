import pdfplumber
import re
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

VALID_STATES_FULL = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Andaman and Nicobar", "Chandigarh",
    "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Lakshadweep",
    "Puducherry", "Jammu and Kashmir", "Ladakh"
]

STATE_ABBR_MAP = {
    "M.P.": "Madhya Pradesh",
    "MP": "Madhya Pradesh",
    "U.P.": "Uttar Pradesh",
    "UP": "Uttar Pradesh",
    "A.P.": "Andhra Pradesh",
    "AP": "Andhra Pradesh",
    "W.B.": "West Bengal",
    "WB": "West Bengal",
    "J&K": "Jammu and Kashmir",
    "H.P.": "Himachal Pradesh",
    "HP": "Himachal Pradesh",
    "T.N.": "Tamil Nadu",
    "TN": "Tamil Nadu"
}

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
    if not val or val == '-' or val == 'NA':
        return 0.0
    try:
        return float(val)
    except ValueError:
        return 0.0

def clamp(v: float) -> float:
    return max(-999_999.99, min(v, 999_999.99))

def parse_states(raw: str) -> list:
    """Extract all valid state names from a raw multi-state string, handling abbreviations."""
    # Try content inside parentheses first
    inside = re.findall(r'\(([^)]+)\)', raw)
    search_text = " , ".join(inside) if inside else raw

    found, seen = [], set()
    
    # Check for abbreviations first to prevent double counting
    for token in re.split(r'[,\s]+', search_text):
        token = token.strip()
        if token in STATE_ABBR_MAP:
            full_name = STATE_ABBR_MAP[token]
            if full_name not in seen:
                found.append(full_name)
                seen.add(full_name)

    # Check for full state names
    for st in VALID_STATES_FULL:
        if st in search_text and st not in seen:
            found.append(st)
            seen.add(st)

    # Fallback to scanning the whole raw string if parenthesis check fails
    if not found:
        for token in re.split(r'[,\s]+', raw):
            token = token.strip()
            if token in STATE_ABBR_MAP:
                full_name = STATE_ABBR_MAP[token]
                if full_name not in seen:
                    found.append(full_name)
                    seen.add(full_name)
        for st in VALID_STATES_FULL:
            if st in raw and st not in seen:
                found.append(st)
                seen.add(st)

    return found if found else ["Delhi"]

def bucket(x0: float) -> str:
    if SL_MIN <= x0 < SL_MAX: return "sl"
    elif x0 < NAME_MAX: return "name"
    elif x0 < STATE_MAX: return "state"
    elif x0 < DATES_MAX: return "dates"
    elif x0 < COST_MAX: return "cost"
    elif x0 < CUM_MAX: return "cum"
    else: return "phys"

def extract_all():
    projects = []
    current_proj = None
    current_sector = "Others"
    prev_orig_cost = ""   

    with pdfplumber.open("FlashReport_April2026.pdf") as pdf:
        for page_num in range(54, 162):
            page = pdf.pages[page_num]

            rows = []
            cur_row = []
            last_top = -1
            for w in page.extract_words(x_tolerance=2, y_tolerance=2):
                if last_top == -1 or abs(w["top"] - last_top) > 4:
                    if cur_row: rows.append(cur_row)
                    cur_row = []
                    last_top = w["top"]
                cur_row.append(w)
            if cur_row: rows.append(cur_row)

            for row in rows:
                row.sort(key=lambda w: w["x0"])
                if not row: continue

                b = {"sl": [], "name": [], "state": [], "dates": [], "cost": [], "cum": [], "phys": []}
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
                    prev_orig_cost = ""
                    continue

                # Skip Ministry / header / footer rows
                if lt.startswith("Ministry of") or "PAIMANA" in line_text or "Page" in line_text:
                    continue

                # Skip Total rows (sector summaries)
                if re.match(r'^Total\s*\(', lt):
                    continue

                # Track prev_orig_cost from dates+cost rows
                if not re.match(r"^\d+$", sl_text) and cost_text:
                    orig_tokens = [t for t in cost_text.split() if not t.startswith("(")]
                    if orig_tokens: prev_orig_cost = orig_tokens[0]
                    rev_tokens = [t for t in cost_text.split() if t.startswith("(")]
                    if rev_tokens and current_proj:
                        current_proj["rev_parts"].extend(rev_tokens)

                # ── Anchor on sl_number (not project code) ────────────────
                # Reason: Many project codes are buried in parentheses e.g. "(705237)"
                # or are not exactly 6 digits. Some rows lack codes altogether.
                # The serial number is the ONLY reliable anchor for a new project.
                if re.match(r"^\d+$", sl_text):
                    if "Total" in line_text:
                        prev_orig_cost = ""
                        continue

                    if current_proj and current_proj.get("project_code"):
                        projects.append(current_proj)

                    code_on_sl = None
                    code_m = re.search(r'\((\d{4,7})\)', name_text)
                    if code_m: code_on_sl = code_m.group(1)

                    if not code_on_sl:
                        code_on_sl = "SL_" + sl_text

                    current_proj = {
                        "project_code": code_on_sl,
                        "project_code_pending": code_on_sl.startswith("SL_"),
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

                # Continuation rows
                if not current_proj: continue

                code_m = re.search(r'\((\d{4,7})\)', name_text)
                if code_m:
                    real_code = code_m.group(1)
                    if current_proj.get("project_code_pending"):
                        current_proj["project_code"] = real_code
                        current_proj["project_code_pending"] = False

                if name_text: current_proj["name_parts"].append(name_text)
                if state_text: current_proj["state_raw"] += " " + state_text

                if cost_text:
                    for t in cost_text.split():
                        if t.startswith("("): current_proj["rev_parts"].append(t)
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
        name = re.sub(r"\(\d{4,7}\)", "", name).strip()
        name = re.sub(r"\s{2,}", " ", name)
        name = name[:255]

        states_list = parse_states(p["state_raw"])
        matched_state = ", ".join(states_list)

        orig_tokens = []
        for part in p["orig_parts"]: orig_tokens.extend(part.split())
        orig_raw = next((t for t in orig_tokens if not t.startswith("(")), "")
        orig = clamp(clean_num(orig_raw))

        rev_tokens = []
        for part in p["rev_parts"]: rev_tokens.extend(part.split())
        rev_raw = next((t for t in rev_tokens if t.startswith("(")), "")
        rev = clamp(clean_num(rev_raw)) if rev_raw else orig

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
            "states_list":            states_list, # JSONB array
            "original_cost":          orig,
            "revised_cost":           rev,
            "cumulative_expenditure": exp,
            "physical_progress":      prog,
            "sector":                 sector,
            "hml_category":           "Others",
        })
    return final

if __name__ == "__main__":
    print("Extracting projects from PDF using hybrid coordinate/anchor strategy...")
    raw = extract_all()
    final_projects = build_final(raw)
    
    print(f"Extraction complete. Total output rows: {len(final_projects)}")
    
    # Assert exactly 1981 ongoing projects
    assert len(final_projects) == 1981, f"Expected 1981 projects, got {len(final_projects)}"
    print("Assertion passed: Exact project count (1981) verified.")

    # Save to JSON to avoid re-parsing if network fails
    with open("projects_seed.json", "w", encoding="utf-8") as f:
        json.dump(final_projects, f, indent=2)
    print("Saved extracted data to projects_seed.json")

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal, resolution=merge-duplicates"
    }
    url = SUPABASE_URL + "/rest/v1/projects?on_conflict=project_code"

    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry

    session = requests.Session()
    retry = Retry(connect=5, backoff_factor=1, status_forcelist=[ 500, 502, 503, 504 ])
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)

    print("Truncating table (all rows)...")
    try:
        session.delete(SUPABASE_URL + "/rest/v1/projects?project_code=not.is.null", headers=headers, timeout=30)
        session.delete(SUPABASE_URL + "/rest/v1/projects?project_code=is.null", headers=headers, timeout=30)
    except Exception as e:
        print(f"Warning: Truncation failed due to network error: {e}")

    chunk_size = 200
    errors = 0
    print("Seeding database...")
    for i in range(0, len(final_projects), chunk_size):
        chunk = final_projects[i: i + chunk_size]
        try:
            resp = session.post(url, headers=headers, json=chunk, timeout=30)
            if resp.status_code not in (200, 201, 204):
                errors += 1
                print("  Failed chunk %d: %d %s" % (i, resp.status_code, resp.text[:200]))
        except Exception as e:
            errors += 1
            print(f"  Failed chunk {i} due to network error: {e}")

    print(f"Seeding complete. Errors: {errors}")

