import os
import json
import urllib.request

api_key = os.environ.get("GOOGLE_API_KEY", "")
if not api_key:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=".env")
    api_key = os.environ.get("GOOGLE_API_KEY", "")

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": api_key
}
data = {
    "contents": [{"parts":[{"text": "Hello, are you there?"}]}]
}
req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print("Success:", json.loads(response.read().decode("utf-8"))["candidates"][0]["content"]["parts"][0]["text"])
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode("utf-8"))
