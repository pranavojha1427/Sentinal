const fs = require('fs');
const file = 'src/app/inspector/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\$\{h\.status === 'project_proposed' \? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'\}/g,
  "${(h.status === 'project_proposed' || h.status === 'project_raised') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}"
);

fs.writeFileSync(file, content);
console.log('Fixed inspector page badge colors');
