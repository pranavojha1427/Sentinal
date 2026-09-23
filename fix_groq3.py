import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'model: "llama-3.1-70b-versatile",',
    'model: "qwen/qwen3.6-27b",'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated model back to qwen/qwen3.6-27b")
