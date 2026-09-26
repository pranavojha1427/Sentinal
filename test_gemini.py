import urllib.request
import json
import os

api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    # Try to extract from .env
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('GOOGLE_API_KEY='):
                api_key = line.split('=')[1].strip()

bengali_text = "আমাদের ঘরের কাছে একটা গোল্ড মাইন পেয়েছি আমরা হেরিটেজ ইনস্টিটিউট অফ টেকনোলজির পেছনে প্লিজ একটু দেখে নাও।"

prompt = f'''
Analyze the following citizen complaint details:
"{bengali_text}"

1. Translate the details to English.
2. Determine the most appropriate infrastructure category (e.g., Roads, Energy, Water, Education, Healthcare, Transport).

Output strictly valid JSON in this format:
{{
  "translated_text": "english translation here",
  "category": "infrastructure category here"
}}
'''

payload = {
    "contents": [{"parts": [{"text": prompt}]}],
    "generationConfig": {"temperature": 0.1}
}

req = urllib.request.Request(
    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}",
    data=json.dumps(payload).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print(json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode())
