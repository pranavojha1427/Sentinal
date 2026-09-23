import os
import json
from supabase import create_client

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url:
    from dotenv import load_dotenv
    load_dotenv(".env")
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(supabase_url, supabase_key)
res = supabase.table("sector_benchmarks").select("*").limit(1).execute()
print("Sector Benchmarks Schema:", res.data[0].keys() if res.data else "Empty")
print("First row:", res.data[0] if res.data else "None")
