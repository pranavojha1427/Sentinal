import dotenv from "dotenv";
dotenv.config();

async function testModel(modelName) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: "You are the MoSPI Intelligence Assistant. All monetary values in INR Crores. Answer using Markdown with tables if useful. Be concise and professional. CRITICAL: You must output ONLY the final answer. DO NOT output <think> tags, DO NOT output internal reasoning, DO NOT output your thinking process. Just the final direct answer." },
              { role: "user", content: "Summarize critical projects showing highest delays" }
            ],
            max_tokens: 500
        })
    });
    
    if (res.ok) {
        const data = await res.json();
        console.log(`[${modelName}]: ${data.choices[0].message.content}`);
    } else {
        console.log(`[${modelName}] Error: ${await res.text()}`);
    }
}
testModel("openai/gpt-oss-20b");
