import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'model: "qwen/qwen3.6-27b",',
    'model: "openai/gpt-oss-20b",'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated model to openai/gpt-oss-20b")
