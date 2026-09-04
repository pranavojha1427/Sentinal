import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    res = supabase.table("project_alerts").insert({
        "project_code": "TEST1234",
        "alert_type": "Test Alert",
        "trigger_reason": "Test",
        "severity": "Warning",
        "status": "Open"
    }).execute()
    print("Success:", res)
except Exception as e:
    print("Error:", e)
