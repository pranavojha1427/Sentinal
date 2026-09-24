import re
content = open('src/components/CitizenPortal.tsx', encoding='utf-8').read()

new_func = '''const handleSendComplaint = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { role: "user", text: inputText }];
    setMessages(newMessages as any);
    const textToSend = inputText;
    setInputText("");

    try {
        let step = 1;
        if (newMessages.length >= 3) {
            step = 2;
        }
        
        const res = await fetch('https://sentinal-api.onrender.com/api/v1/citizen/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: newMessages, step })
        });
        
        const data = await res.json();
        const aiText = data.text || "Thank you. We have forwarded your complaint to the concerned department.";
        
        const finalMessages = [...newMessages, { role: "system", text: aiText }];
        setMessages(finalMessages as any);
        
        if (step === 2 && location) {
            fetch('https://sentinal-api.onrender.com/api/v1/citizen/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number: mobile,
                    device_id: "pulse_web",
                    lat: location.lat,
                    lon: location.lon,
                    raw_text: textToSend, // Sending the initial complaint text
                    language: "auto"
                })
            }).catch(e => console.error("API error", e));
        }
    } catch (e) {
        console.error("Chat error", e);
    }
  };'''

content = re.sub(r'const handleSendComplaint = async \(\) => \{.*?\n  \};', new_func, content, flags=re.DOTALL)
open('src/components/CitizenPortal.tsx', 'w', encoding='utf-8').write(content)
print('Done!')
