const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/session\.role/g, 'session?.role');
content = content.replace(/session\.ministry/g, 'session?.ministry');
content = content.replace(/session\.agency/g, 'session?.agency');

fs.writeFileSync(path, content, 'utf8');
console.log("Updated page.tsx with optional chaining!");
