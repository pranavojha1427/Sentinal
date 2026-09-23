const fs = require('fs');
const path = 'src/lib/mongodb.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const options = {};',
  'const options = { serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000 };'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed mongodb.ts");
