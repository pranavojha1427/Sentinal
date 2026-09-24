import re
with open('src/app/api/citizen-chat/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'const extracted = JSON\.parse\(responseText\);\s*responseText = extracted\.replyToUser;',
    '''let cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const extracted = JSON.parse(cleanedText);
        responseText = extracted.replyToUser || extracted.reply_to_user || "Thank you. We have forwarded your complaint to the concerned department.";''',
    content
)

with open('src/app/api/citizen-chat/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
