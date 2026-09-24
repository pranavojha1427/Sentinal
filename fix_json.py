with open('src/app/api/citizen-chat/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const extracted = JSON.parse(responseText);\n          responseText = extracted.replyToUser;',
    '''let cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const extracted = JSON.parse(cleanedText);
          responseText = extracted.replyToUser || extracted.reply_to_user || "Thank you. We have forwarded your complaint to the concerned department.";'''
)

content = content.replace(
    'fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}`);',
    "fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}`, { headers: { 'User-Agent': 'PragatiPulse/1.0' } });"
)

with open('src/app/api/citizen-chat/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
