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
sys_prompt = """You are the MoSPI Intelligence Assistant. All monetary values in INR Crores.
You are talking to a user with role: ADMIN (Name: System Administrator, Organization: System Admin).
You have full unrestricted access to all MoSPI data.

Total Accessible Portfolio: 1981 projects, Original Cost: 10000 Cr, Revised Cost: 12000 Cr, Cumulative Expenditure: 5000 Cr.

Ministry breakdown:
Ministry of Railways: 500 projects, O=5000, R=6000, E=2000
Ministry of Road Transport and Highways: 500 projects, O=3000, R=4000, E=2000
Ministry of Power: 200 projects, O=1000, R=1000, E=500
Others: 781 projects, O=1000, R=1000, E=500

Answer using Markdown with tables if useful. Be concise and professional. CRITICAL: You must output ONLY the final answer. DO NOT output <think> tags, DO NOT output internal reasoning, DO NOT output your thinking process. Just the final direct answer."""

data = {
    "model": "openai/gpt-oss-20b",
    "messages": [
        { "role": "system", "content": sys_prompt },
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
