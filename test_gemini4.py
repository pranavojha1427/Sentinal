import os
import json
import urllib.request

api_key = os.environ.get("GOOGLE_API_KEY", "")
if not api_key:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=".env")
    api_key = os.environ.get("GOOGLE_API_KEY", "")

url = "https://generativelanguage.googleapis.com/v1beta/models"
headers = {
    "x-goog-api-key": api_key
}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        models = json.loads(response.read().decode("utf-8"))["models"]
        print([m["name"] for m in models if "generateContent" in m["supportedGenerationMethods"]])
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode("utf-8"))
