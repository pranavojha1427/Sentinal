import os
import sys
import time
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
from concurrent.futures import ThreadPoolExecutor, as_completed

# Load environment variables
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, "..", ".env")
load_dotenv(env_path)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_KEY missing in environment variables.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

csv_path = os.path.join(script_dir, "data", "ml_training_dataset.csv")
if not os.path.exists(csv_path):
    print(f"Error: CSV file not found at {csv_path}")
    sys.exit(1)

print(f"Reading dataset from {csv_path}...")
df = pd.read_csv(csv_path)
total_rows = len(df)
print(f"Loaded {total_rows} rows from CSV.")

import threading

# Thread-local storage for Supabase client
thread_local = threading.local()

def get_supabase_client() -> Client:
    if not hasattr(thread_local, "client"):
        thread_local.client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return thread_local.client

def update_project(row_data):
    project_id = int(row_data["project_id"])
    payload = {
        "land_acquisition_issue": int(row_data["land_acquisition_issue"]),
        "forest_clearance_issue": int(row_data["forest_clearance_issue"]),
        "contractor_delay": int(row_data["contractor_delay"]),
        "burn_rate_6m": float(row_data["burn_rate_6m"]),
        "phys_burn_rate_6m": float(row_data["phys_burn_rate_6m"]),
    }
    
    last_err = None
    for attempt in range(4):
        try:
            client = get_supabase_client()
            res = client.table("projects").update(payload).eq("id", project_id).execute()
            if res.data and len(res.data) > 0:
                return (project_id, True, None)
            else:
                return (project_id, False, "No row returned or project ID not found")
        except Exception as e:
            last_err = str(e)
            # Recreate thread-local client on connection error
            if hasattr(thread_local, "client"):
                del thread_local.client
            time.sleep(0.3 * (2 ** attempt))
    return (project_id, False, last_err)

def main():
    print(f"Starting synchronization of {total_rows} projects to Supabase...")
    start_time = time.time()
    
    updated_count = 0
    failed_count = 0
    errors = []

    # Convert dataframe to records
    records = df.to_dict(orient="records")

    max_workers = 20
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(update_project, record): record["project_id"] for record in records}
        completed = 0
        for future in as_completed(futures):
            pid, success, err = future.result()
            completed += 1
            if success:
                updated_count += 1
            else:
                failed_count += 1
                errors.append((pid, err))
            
            if completed % 200 == 0 or completed == total_rows:
                elapsed = time.time() - start_time
                print(f"Progress: {completed}/{total_rows} processed ({updated_count} updated, {failed_count} failed) in {elapsed:.1f}s")

    total_time = time.time() - start_time
    print(f"\n--- Synchronization Finished ---")
    print(f"Total rows in CSV: {total_rows}")
    print(f"Successfully updated rows: {updated_count}")
    print(f"Failed updates: {failed_count}")
    print(f"Total time: {total_time:.2f} seconds")
    
    if errors:
        print(f"\nSample errors (first 5):")
        for pid, err in errors[:5]:
            print(f"  Project {pid}: {err}")

if __name__ == "__main__":
    main()
