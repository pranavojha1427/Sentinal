import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, step } = await req.json();
    
    let prompt = "";
    if (step === 1) {
      prompt = "You are a helpful assistant for the PragatiPulse Citizen Participation Portal. The user has just reported a problem regarding public infrastructure. Acknowledge their issue briefly in the EXACT SAME LANGUAGE they used, and ask them for one more detail (like exact location or severity). Do not solve the problem, just ask for details. Keep it to 1-2 sentences. DO NOT use English unless the user used English.";
    } else {
      prompt = "You are a helpful assistant for the PragatiPulse Citizen Participation Portal. The user has provided more details about their infrastructure problem. Analyze their complaint and determine which specific Indian Government Ministry or Department is responsible (e.g., 'Ministry of Road Transport and Highways', 'Municipal Corporation', 'Water Board', etc.). Then, reply in the EXACT SAME LANGUAGE they used. Thank them and explicitly state which department their complaint has been forwarded to. Keep it to 1-3 sentences. DO NOT use English unless the user used English.";
    }

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'system' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    let res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GOOGLE_API_KEY!
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: prompt }]
        },
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.3
        }
      })
    });
    
    // Simple retry on 503
    if (res.status === 503) {
      await new Promise(r => setTimeout(r, 1000));
      res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GOOGLE_API_KEY!
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: prompt }]
            },
            contents: formattedMessages,
            generationConfig: {
              temperature: 0.3
            }
          })
      });
    }

    if (!res.ok) {
        console.error("Gemini API Error:", await res.text());
        return NextResponse.json({ text: `Thank you. We have forwarded your complaint to the concerned department.` });
    }

    const data = await res.json();
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (responseText) {
        return NextResponse.json({ text: responseText });
    } else {
        return NextResponse.json({ text: "Thank you. We have forwarded your complaint to the concerned department." });
    }
  } catch (error: any) {
    console.error("Chat API caught error:", error);
    return NextResponse.json({ text: `Thank you. We have forwarded your complaint to the concerned department.` });
  }
}
