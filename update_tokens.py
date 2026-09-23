import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Increase max_tokens
content = content.replace('max_tokens: 500,', 'max_tokens: 900,')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated max_tokens to 900")
