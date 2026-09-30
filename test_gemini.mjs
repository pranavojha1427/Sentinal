const details = 'We have large potholes on a road near our house. Kindly fix it.';
const prompt = `
    Analyze the following citizen complaint details:
    "${details}"
    
    1. Identify the language. If it is NOT English, accurately translate it to English. If it is already in English, return it exactly as is.
    2. Determine the most appropriate infrastructure category from this strict list: Roads, Energy, Water, Education, Healthcare, Transport, Others.
    
    CRITICAL: The "translated_text" field MUST ALWAYS be in English. NEVER output Bengali, Hindi, or any other regional language in the translated_text field.
    
    Output strictly valid JSON in this format:
    {
      "translated_text": "<English translation of the complaint>",
      "category": "<Category name>"
    }`;

fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + process.env.GOOGLE_API_KEY, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1 }
  })
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)));
