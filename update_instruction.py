import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_instruction = """Answer using Markdown with tables if useful. Be concise and professional. CRITICAL: You must output ONLY the final answer. DO NOT output <think> tags, DO NOT output internal reasoning, DO NOT output your thinking process. Just the final direct answer."""

new_instruction = """Answer using Markdown with tables if useful. Be EXTREMELY concise and professional. 
CRITICAL RULES:
1. You MUST limit any table or list to a MAXIMUM of 3-5 rows. Do NOT attempt to list all data, summarize only the top items to avoid token cutoffs.
2. You must output ONLY the final answer. 
3. DO NOT output <think> tags, internal reasoning, or thinking process. Just the final direct answer."""

content = content.replace(old_instruction, new_instruction)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated instruction for extreme conciseness")
