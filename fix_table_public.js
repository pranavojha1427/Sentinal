const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<Card className="bg-white border-slate-200 rounded-none border-2 shadow-\[4px_4px_0px_0px_rgba\(0,0,0,0\.1\)\] overflow-hidden">[\s\S]*?<CardContent className="p-0"><ProjectTableAI projects=\{mappedProjects\} \/><\/CardContent>\s*<\/Card>/;

content = content.replace(regex, (match) => `{currentUser && (\n${match}\n)}`);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated ProjectTableAI!");
