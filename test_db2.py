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
res = supabase.table("projects").select("id, sector, project_name").eq("sector", "Roads & Highways").execute()
print(f"Total Roads & Highways projects in DB: {len(res.data)}")

# Let's count all sectors in DB
res2 = supabase.table("projects").select("sector").execute()
import pandas as pd
df = pd.DataFrame(res2.data)
print(df["sector"].value_counts())
