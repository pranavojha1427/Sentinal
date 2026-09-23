const fs = require('fs');
const path = 'src/components/ProjectTableAI.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/className="bg-red-950 text-red-500 border border-red-900 rounded-none"/g, 'className="bg-red-100 text-red-800 border border-red-200 rounded-none"');
content = content.replace(/className="bg-orange-950 text-orange-500 border border-orange-900 rounded-none"/g, 'className="bg-orange-100 text-orange-800 border border-orange-200 rounded-none"');
content = content.replace(/className="bg-amber-950 text-amber-500 border border-amber-900 rounded-none"/g, 'className="bg-amber-100 text-amber-800 border border-amber-200 rounded-none"');
content = content.replace(/className="bg-green-950 text-green-500 border border-green-900 rounded-none"/g, 'className="bg-green-100 text-green-800 border border-green-200 rounded-none"');

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed colors in ProjectTableAI");
