import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    r"responseText.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();",
    r"responseText.replace(/<think>[\s\S]*?(<\/think>|$)\s*/gi, '').trim();"
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated regex to be bulletproof against unclosed <think> tags")
