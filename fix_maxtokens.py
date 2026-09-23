import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'max_tokens: 768,',
    'max_tokens: 4096,'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated max_tokens to 4096")
