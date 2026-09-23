const fs = require('fs');
const path = 'src/app/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('{session && <ChatAssistant />}', '<ChatAssistant />');

fs.writeFileSync(path, content, 'utf8');
console.log("Un-hid chatbot");
