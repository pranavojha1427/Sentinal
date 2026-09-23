import pandas as pd
from supabase import create_client
import os, sys
from dotenv import load_dotenv

load_dotenv('.env')
url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
if not url or not key: sys.exit('No env')

df = pd.read_csv('predictive_service/data/ml_training_dataset.csv')
projects = ['619854', '701105', '611570', '701127', '701128', '706718', '618977', '612789', '400010', '701126', '612787', '611682', '612183', '611485']

supabase = create_client(url, key)
res = supabase.table('projects').select('id, project_code').in_('project_code', projects).execute()
id_map = {str(r['project_code']): r['id'] for r in res.data}

for code in projects:
    if code in id_map:
        row = df[df['project_id'] == id_map[code]]
        if not row.empty:
            actual = row.iloc[0]
            print(f"Project {code}: target_cost_overrun = {actual['target_cost_overrun_pct']:.1f}%, land={actual['land_acquisition_issue']}, contractor={actual['contractor_delay']}, forest={actual['forest_clearance_issue']}")
