import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { name, phone, details, location, ministry } = await req.json();

    // 1. Reverse Geocode to get State
    let state = "Unknown";
    let locationStr = null;
    if (location && location.lat && location.lon) {
      locationStr = `POINT(${location.lon} ${location.lat})`;
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}`, {
          headers: { 'User-Agent': 'PragatiPulse/1.0' }
        });
        const geoData = await geoRes.json();
        state = geoData.address?.state || "Unknown";
      } catch(e) {
        console.error("Geocoding failed", e);
      }
    }

    // 2. Translate Details and Determine Category using Gemini
    const prompt = `
    Analyze the following citizen complaint details:
    "${details}"
    
    1. Translate the details to English.
    2. Determine the most appropriate infrastructure category (e.g., Roads, Energy, Water, Education, Healthcare, Transport).
    
    Output strictly valid JSON in this format:
    {
      "translated_text": "english translation here",
      "category": "infrastructure category here"
    }`;

    let translated_text = details;
    let category = "Others";

    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + process.env.GOOGLE_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const match = cleanedText.match(/\{[\s\S]*\}/);
        const extracted = match ? JSON.parse(match[0]) : JSON.parse(cleanedText);
        
        translated_text = extracted.translated_text || details;
        category = extracted.category || "Others";
      }
    } catch (e) {
      console.error("Gemini translation error:", e);
    }

    // 3. Save to Supabase
    const { error: dbError } = await supabase.from('citizen_requests').insert({
      name: name,
      hashed_phone: phone || 'anonymous',
      location: locationStr,
      raw_text: details,
      translated_text: translated_text,
      infrastructure_category: category,
      ministry: ministry,
      status: 'pending',
      channel: 'portal',
      state: state
    });

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 });
  }
}
