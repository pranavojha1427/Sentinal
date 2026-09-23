const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const overrides = await getProjectOverrides(baseProjects.map((p: any) => p.id));',
  'const overrides = await getProjectOverrides(baseProjects.map((p: any) => p.id)).catch(e => { console.error("MongoDB Overrides Error:", e); return []; });'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed page.tsx overrides catch");
