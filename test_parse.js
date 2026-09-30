const responseText = "```json\n{\n  \"translated_text\": \"We have large potholes on a road near our house. Kindly fix it.\",\n  \"category\": \"Roads\"\n}\n```";
const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
const match = cleanedText.match(/\{[\s\S]*\}/);
const extracted = match ? JSON.parse(match[0]) : JSON.parse(cleanedText);
console.log(extracted);
