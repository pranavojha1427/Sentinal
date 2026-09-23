import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'model: "qwen/qwen3.6-27b",',
    'model: "llama-3.3-70b-versatile",'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated model to llama-3.3-70b-versatile to stop thinking logs")
