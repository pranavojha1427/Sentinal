with open('src/app/api/submit-complaint/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_prompt = """    const prompt = `
    Analyze the following citizen complaint details:
    "${details}"
    
    1. Translate the details to English.
    2. Determine the most appropriate infrastructure category (e.g., Roads, Energy, Water, Education, Healthcare, Transport).
    
    Output strictly valid JSON in this format:
    {
      "translated_text": "english translation here",
      "category": "infrastructure category here"
    }`;"""

new_prompt = """    const prompt = `
    Analyze the following citizen complaint details:
    "${details}"
    
    1. Identify the language. If it is NOT English, accurately translate it to English. If it is already in English, return it exactly as is.
    2. Determine the most appropriate infrastructure category from this strict list: Roads, Energy, Water, Education, Healthcare, Transport, Others.
    
    CRITICAL: The "translated_text" field MUST ALWAYS be in English. NEVER output Bengali, Hindi, or any other regional language in the translated_text field.
    
    Output strictly valid JSON in this format:
    {
      "translated_text": "<English translation of the complaint>",
      "category": "<Category name>"
    }`;"""

if old_prompt in content:
    content = content.replace(old_prompt, new_prompt)
    with open('src/app/api/submit-complaint/route.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Prompt updated.")
else:
    print("Could not find the old prompt.")
