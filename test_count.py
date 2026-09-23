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
res = supabase.table("projects").select("id", count="exact").execute()
print(f"Exact count in projects: {res.count}")
