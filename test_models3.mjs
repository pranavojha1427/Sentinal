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
              { role: "system", content: "CRITICAL INSTRUCTION: DO NOT USE <think> tags. Output the answer directly without any reasoning." },
              { role: "user", content: "What is 2+2? Answer simply." }
            ],
            max_tokens: 250
        })
    });
    
    if (res.ok) {
        const data = await res.json();
        console.log(`[${modelName}]: ${data.choices[0].message.content}`);
    } else {
        console.log(`[${modelName}] Error: ${await res.text()}`);
    }
}
testModel("qwen/qwen3.6-27b");
