import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('models/gemini-2.5-flash:generateContent', 'models/gemini-3.6-flash:generateContent')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated to gemini-3.6-flash")
