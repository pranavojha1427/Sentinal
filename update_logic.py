import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """    // Check if it's purely a think tag that didn't close, to avoid erasing everything
    if (responseText.includes("<think>") && !responseText.includes("</think>")) {
       // If it didn't close, it means the entire response was thinking. We should probably return a fallback.
       responseText = "The AI was thinking but hit a limit. Try a simpler question.";
    } else {
       // Strip <think>...</think> tags safely
       responseText = responseText.replace(/<think>[\\s\\S]*?<\\/think>\\s*/gi, '').trim();
    }"""

new_logic = """    // 9. Clean up reasoning tags safely
    if (responseText.includes("<think>") && !responseText.includes("</think>")) {
       // It got cut off mid-thought due to token limits. Strip the opening tag and let the user see the partial thought.
       responseText = responseText.replace(/<think>/gi, '').trim() + "\\n\\n*(Response was cut off due to token limits)*";
    } else {
       // Safely strip fully closed think blocks
       responseText = responseText.replace(/<think>[\\s\\S]*?<\\/think>\\s*/gi, '').trim();
    }"""

content = content.replace(old_logic, new_logic)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated think tag cleanup logic")
