const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'currentUser={session}',
  'currentUser={session || undefined}'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed page.tsx");
