import re

with open('src/app/api/citizen-chat/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
          let cleanedText = responseText;
          let extracted: any = {};
          try {
            const match = cleanedText.match(/\\{[\\s\\S]*\\}/);
            if (match) {
              extracted = JSON.parse(match[0]);
            } else {
              extracted = JSON.parse(cleanedText);
            }
          } catch(err) {
            console.error("JSON parse error:", err, "Raw text:", responseText);
            extracted = { replyToUser: "Thank you. We have forwarded your complaint to the concerned department." };
          }
          responseText = extracted.replyToUser || extracted.reply_to_user || "Thank you. We have forwarded your complaint to the concerned department.";
"""

content = re.sub(
    r'let cleanedText = responseText\.replace\(/```json/gi, \'\'\)\.replace\(/```/g, \'\'\)\.trim\(\);\s*const extracted = JSON\.parse\(cleanedText\);\s*responseText = extracted\.replyToUser \|\| extracted\.reply_to_user \|\| \"Thank you\. We have forwarded your complaint to the concerned department\.\";',
    replacement.strip(),
    content
)

with open('src/app/api/citizen-chat/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
