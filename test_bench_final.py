import os
from supabase import create_client

from dotenv import load_dotenv
load_dotenv(".env")
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(supabase_url, supabase_key)

res = supabase.table("sector_benchmarks").select("*").execute()
for r in res.data:
    print(f"{r['sector']}: {r['project_count']}")
