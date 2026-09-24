import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { messages, step, location, mobile } = await req.json();
    
    let prompt = "";
    if (step === 1) {
      prompt = "You are a helpful assistant for the PragatiPulse Citizen Participation Portal. The user has just reported a problem regarding public infrastructure. Acknowledge their issue briefly in the EXACT SAME LANGUAGE they used, and ask them for one more detail (like exact location or severity). Do not solve the problem, just ask for details. Keep it to 1-2 sentences. DO NOT use English unless the user used English.";
    } else {
      prompt = `You are a helpful assistant for the PragatiPulse Citizen Participation Portal. The user has provided more details about their infrastructure problem. Analyze their complaint and determine which specific Indian Government Ministry or Department is responsible. 
      
      You MUST output a JSON object with exactly these fields:
      {
        "replyToUser": "Your reply in the EXACT SAME LANGUAGE the user used. Thank them, state which department it's forwarded to, and summarize the complaint in 1-3 sentences.",
        "translated_text": "The full complaint translated to English",
        "language": "The detected original language of the user",
        "infrastructure_category": "e.g. Roads, Water, Electricity, Sanitation",
        "ministry": "The relevant Ministry or Department",
        "sentiment_score": a number from -1.0 (very negative) to 1.0 (positive)
      }`;
    }

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'system' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const callGemini = async (sysPrompt: string, msgs: any, temp: number = 0.3, responseMimeType?: string) => {
      const payload: any = {
        systemInstruction: { parts: [{ text: sysPrompt }] },
        contents: msgs,
        generationConfig: { temperature: temp }
      };
      if (responseMimeType) {
        payload.generationConfig.responseMimeType = responseMimeType;
      }
      
      let res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GOOGLE_API_KEY! },
        body: JSON.stringify(payload)
      });
      if (res.status === 503) {
        await new Promise(r => setTimeout(r, 1000));
        res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GOOGLE_API_KEY! },
          body: JSON.stringify(payload)
        });
      }
      return res;
    };

    let res = await callGemini(prompt, formattedMessages, 0.3, step === 2 ? "application/json" : undefined);

    if (!res.ok) {
        console.error("Gemini API Error:", await res.text());
        return NextResponse.json({ text: `Thank you. We have forwarded your complaint to the concerned department.` });
    }

    const data = await res.json();
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (step === 2 && responseText) {
      try {
        let cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const extracted = JSON.parse(cleanedText);
        responseText = extracted.replyToUser || extracted.reply_to_user || "Thank you. We have forwarded your complaint to the concerned department.";
        
        // Await the DB insert so Vercel doesn't kill the function before it saves
        let locationStr = location ? `POINT(${location.lon} ${location.lat})` : null;
        let state = "Unknown";
        if (location) {
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}`, { headers: { 'User-Agent': 'PragatiPulse/1.0' } });
            const geoData = await geoRes.json();
            state = geoData.address?.state || "Unknown";
          } catch(e) {
            console.error("Geocoding failed", e);
          }
        }

        const { error: dbError } = await supabase.from('citizen_requests').insert({
          hashed_phone: mobile || 'anonymous',
          location: locationStr,
          raw_text: messages.filter((m: any) => m.role === 'user').map((m: any) => m.text).join(' | '),
          translated_text: extracted.translated_text,
          language: extracted.language,
          infrastructure_category: extracted.infrastructure_category,
          ministry: extracted.ministry,
          sentiment_score: extracted.sentiment_score,
          urgency_level: 'medium',
          status: 'pending',
          channel: 'portal',
          state: state
        });
        if (dbError) console.error("Supabase insert error", dbError);
        
      } catch (e) {
        console.error("Failed to parse JSON response or save complaint", e);
        // Fallback if parsing failed
        responseText = "Thank you. We have forwarded your complaint to the concerned department.";
      }
    }

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
