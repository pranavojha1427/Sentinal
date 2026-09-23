import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the Groq API call with Google Gemini REST API call
old_fetch = """    // 8. Fetch from LLM
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `/no_think\\n${message}` }
        ],
        temperature: 0.1,
        max_tokens: 900,
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API Error:", res.status, errText);
      throw new Error(`Groq API error: ${res.status}`);
    }

    const data = await res.json();
    let responseText = data.choices[0].message.content || "";
    
    console.log("Raw LLM Response:", responseText);
    
    // 9. Clean up reasoning tags safely
    if (responseText.includes("<think>") && !responseText.includes("</think>")) {
       // It got cut off mid-thought due to token limits. Strip the opening tag and let the user see the partial thought.
       responseText = responseText.replace(/<think>/gi, '').trim() + "\\n\\n*(Response was cut off due to token limits)*";
    } else {
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
    
    // If it's completely empty after stripping, return the raw so we see something
    if (!responseText) {
       responseText = data.choices[0].message.content || "Empty response from API.";
    }
    
    console.log("Final ResponseText:", responseText);
    return NextResponse.json({ response: responseText });"""

new_fetch = """    // 8. Fetch from Gemini AI (Google)
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GOOGLE_API_KEY!
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          { parts: [{ text: message }] }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096, // Huge token limit
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API Error:", res.status, errText);
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    
    console.log("Final ResponseText:", responseText);
    return NextResponse.json({ response: responseText });"""

content = content.replace(old_fetch, new_fetch)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Switched Chat API to Google Gemini!")
