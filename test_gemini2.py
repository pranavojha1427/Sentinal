import os
import json
import urllib.request

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
headers = {
    "Content-Type": "application/json"
}
data = {
    "contents": [{"parts":[{"text": "Hello, are you there?"}]}]
}
req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode("utf-8"))
