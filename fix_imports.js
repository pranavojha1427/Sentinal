const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('useEffect, Suspense, useEffect', 'useEffect, Suspense');
fs.writeFileSync(path, content, 'utf8');
console.log("Fixed imports");
