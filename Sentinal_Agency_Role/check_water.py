import os
from supabase import create_client
supabase = create_client('https://ygbtrapskuguoagegftn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYnRyYXBza3VndW9hZ2VnZnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTQ0NDYsImV4cCI6MjEwMzk5MDQ0Nn0.lcQ-_NTto0QTFHqf5J4z8waxvi_DLWEhNMRxUyacW6c')

all_data = []
page = 0
while True:
    res = supabase.table('projects').select('*').range(page*1000, (page+1)*1000 - 1).execute()
    all_data.extend(res.data)
    if len(res.data) < 1000: break
    page += 1

print('Total rows:', len(all_data))
water = [p for p in all_data if p['sector'] in ('Water Resources', 'Waste & Water')]
print(f'Count: {len(water)}, Orig: {sum(p["original_cost"] or 0 for p in water)}')

water_only = [p for p in all_data if p['sector'] == 'Water Resources']
print(f'Water Resources only: Count: {len(water_only)}, Orig: {sum(p["original_cost"] or 0 for p in water_only)}')
