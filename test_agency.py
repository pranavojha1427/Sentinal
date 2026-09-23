import os
from supabase import create_client

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
if not supabase_url:
    from dotenv import load_dotenv
    load_dotenv(".env")
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(supabase_url, supabase_key)
res = supabase.table("agency_performance_rankings").select("*").limit(1).execute()
print("Agency Benchmarks Schema:", res.data[0].keys() if res.data else "Empty")
