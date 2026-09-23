import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """    } else {
       // Safely strip fully closed think blocks
       responseText = responseText.replace(/<think>[\\s\\S]*?<\\/think>\\s*/gi, '').trim();
    }
    
    // If it's completely empty after stripping, return the raw so we see something"""

new_logic = """    } else {
       // Safely strip fully closed think blocks
       responseText = responseText.replace(/<think>[\\s\\S]*?<\\/think>\\s*/gi, '').trim();
    }
    
    // Auto-fix broken markdown tables if the response was cut off exactly at the separator row
    if (/\\|[-|:\\s]+$/.test(responseText.trim())) {
       const columnCount = (responseText.match(/\\|/g) || []).length / 2; // rough estimate
       responseText = responseText.trim() + "\\n" + "| (Cut off) ".repeat(Math.max(1, Math.floor(columnCount))) + "|";
       responseText += "\\n\\n*(Warning: Output was cut off by token limits)*";
    }
    // Auto-fix if it was cut off in the middle of a data row (missing ending pipe)
    else if (responseText.includes('|') && !responseText.trim().endsWith('|') && responseText.split('\\n').pop().includes('|')) {
       responseText = responseText.trim() + " |\\n\\n*(Warning: Output was cut off by token limits)*";
    }
    
    // If it's completely empty after stripping, return the raw so we see something"""

content = content.replace(old_logic, new_logic)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated markdown table auto-fixer")
