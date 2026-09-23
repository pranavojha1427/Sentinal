const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\{TAB_ITEMS\.filter/g,
  '{currentUser && TAB_ITEMS.filter'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated TAB_ITEMS!");
