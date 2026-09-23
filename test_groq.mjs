import dotenv from "dotenv";
dotenv.config();
fetch("https://api.groq.com/openai/v1/models", {
    headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` }
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data.data.map(m => m.id), null, 2)))
.catch(console.error);
