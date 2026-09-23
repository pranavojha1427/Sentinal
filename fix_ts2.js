const fs = require('fs');
const path = 'src/app/api/notifications/route.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const queries = [{ userId: session.id }];',
  'const queries: any[] = [{ userId: session.id }];'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed notifications route.ts");
