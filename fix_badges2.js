const fs = require('fs');
const path = 'src/components/ProjectTableAI.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix emerald to light tone
content = content.replace(
  'className="bg-emerald-950 text-emerald-500 border border-emerald-500 rounded-none"',
  'className="bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-none"'
);

// Darken red
content = content.replace(
  'className="bg-red-100 text-red-800 border border-red-200 rounded-none"',
  'className="bg-red-200 text-red-900 border border-red-300 rounded-none"'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed colors in ProjectTableAI");
