import os
import json
import urllib.request

api_key = os.environ.get("GROQ_API_KEY", "")
if not api_key:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=".env")
    api_key = os.environ.get("GROQ_API_KEY", "")

url = "https://api.groq.com/openai/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}
data = {
    "model": "openai/gpt-oss-20b",
    "messages": [
        { "role": "system", "content": "You are the MoSPI Intelligence Assistant..." },
        { "role": "user", "content": "/no_think\nSummarize critical projects showing highest delays" }
    ],
    "temperature": 0.1,
    "max_tokens": 500
}

req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        res = response.read().decode("utf-8")
        print(res)
except Exception as e:
    print(e)
