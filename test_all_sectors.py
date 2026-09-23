import os
import pandas as pd
from supabase import create_client

from dotenv import load_dotenv
load_dotenv(".env")
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(supabase_url, supabase_key)

all_db = []
for i in range(3):
    res = supabase.table("projects").select("sector").range(i*1000, (i+1)*1000 - 1).execute()
    all_db.extend(res.data)

df = pd.DataFrame(all_db)
print(df["sector"].value_counts())
