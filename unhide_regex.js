const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use regex to remove `{currentUser && (` and the trailing `)}` around the Card
content = content.replace(
  /\{currentUser && \(\s*(<Card className="bg-white border-slate-200 rounded-none border-2 shadow-\[4px_4px_0px_0px_rgba\(0,0,0,0\.1\)\] overflow-hidden">[\s\S]*?<\/Card>)\s*\)\}/,
  '$1'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Un-hid using regex");
