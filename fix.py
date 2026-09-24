import sys
content = open('src/components/CitizenPortal.tsx', encoding='utf-8').read()
content = content.replace('नमस्ते! आप अपनी शिकायत बोलकर या लिखकर दर्ज कर सकते हैं।', 'Welcome! You can register your complaint by speaking or typing in any language (English, Hindi, Bengali, etc.).')
content = content.replace('धन्यवाद। हमने आपकी शिकायत (लोकेशन के साथ) संबंधित विभाग को भेज दी है।', 'Thank you. We have forwarded your complaint and location to the concerned department.')
content = content.replace('क्या आप कृपया हमें समस्या के बारे में और जानकारी दे सकते हैं ताकि हम संबंधित विभाग को सूचित कर सकें?', 'Could you please provide more details about the issue so we can inform the correct department?')
content = content.replace('आप "${p.project_name}" के लिए अपना फीडबैक बोलकर या लिखकर दर्ज कर सकते हैं।', 'You can provide your feedback for "${p.project_name}" by speaking or typing in any language.')
open('src/components/CitizenPortal.tsx', 'w', encoding='utf-8').write(content)
print('Done!')
