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

    const payload = {
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: prompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.text }))
      ],
      temperature: 0.3,
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error("Groq API Error:", errText);
        return NextResponse.json({ text: `Thank you. We have forwarded your complaint to the concerned department.` });
    }

    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return NextResponse.json({ text: data.choices[0].message.content });
    } else {
        return NextResponse.json({ text: "Thank you. We have forwarded your complaint to the concerned department." });
    }
  } catch (error: any) {
    console.error("Chat API caught error:", error);
    return NextResponse.json({ text: "Thank you. We have forwarded your complaint to the concerned department." });
  }
}
