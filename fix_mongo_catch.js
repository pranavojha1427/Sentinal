const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'getMongoProjects(),',
  'getMongoProjects().catch(e => { console.error("MongoDB Fetch Error:", e); return []; }),'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed page.tsx mongo catch");
