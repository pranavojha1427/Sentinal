import re
content = open('src/components/CitizenPortal.tsx', encoding='utf-8').read()

new_func = '''const handleSendComplaint = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { role: "user", text: inputText }];
    setMessages(newMessages as any);
    const textToSend = inputText;
    setInputText("");

    // Simple mocked AI conversational flow for demonstration
    setTimeout(() => {
      if (newMessages.length === 2) {
        setMessages([...newMessages, { role: "system", text: "Could you please provide more details about the issue so we can inform the correct department?" }] as any);
      } else if (newMessages.length === 4) {
        setMessages([...newMessages, { role: "system", text: "Thank you. We have forwarded your complaint and location to the concerned department." }] as any);
        
        // Actually submit to our FastAPI / Supabase backend here
        if (location) {
          fetch('https://sentinal-api.onrender.com/api/v1/citizen/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone_number: mobile,
                device_id: "pulse_web",
                lat: location.lat,
                lon: location.lon,
                raw_text: textToSend, // Sending the initial complaint text
                language: "en"
            })
          }).catch(e => console.error("API error", e));
        }
      }
    }, 1000);
  };'''

content = re.sub(r'const handleSendComplaint = async \(\) => \{.*?\n  \};', new_func, content, flags=re.DOTALL)
open('src/components/CitizenPortal.tsx', 'w', encoding='utf-8').write(content)
print('Done!')
