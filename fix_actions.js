const fs = require('fs');
const path = 'src/app/actions.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const mongoProjects = await getMongoProjects();',
  'const mongoProjects = await getMongoProjects().catch(e => { console.error("Mongo Error in actions:", e); return []; });'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed actions.ts");
