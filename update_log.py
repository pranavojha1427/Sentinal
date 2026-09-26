import re

with open('src/app/api/submit-complaint/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_block = """      if (res.ok) {
        const data = await res.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const match = cleanedText.match(/\\{[\\s\\S]*\\}/);
        const extracted = match ? JSON.parse(match[0]) : JSON.parse(cleanedText);
        
        translated_text = extracted.translated_text || details;
        category = extracted.category || "Others";
      } else {
        const errText = await res.text();
        console.error("Gemini API returned NOT OK:", res.status, errText);
      }"""

content = re.sub(r'if \(res\.ok\) \{.*?category = extracted\.category \|\| "Others";\n      \}', new_block, content, flags=re.DOTALL)

with open('src/app/api/submit-complaint/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
