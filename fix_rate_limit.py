import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'max_tokens: 4096,',
    'max_tokens: 800,'
)

# Also update the prompt to heavily discourage thinking
old_prompt_line = "Answer using Markdown with tables if useful. Be concise and professional. Do NOT output <think> tags or internal reasoning.`;"
new_prompt_line = "Answer using Markdown with tables if useful. Be concise and professional. CRITICAL: You must output ONLY the final answer. DO NOT output <think> tags, DO NOT output internal reasoning, DO NOT output your thinking process. Just the final direct answer.`;"

content = content.replace(old_prompt_line, new_prompt_line)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated max_tokens to 800 and updated system prompt")
