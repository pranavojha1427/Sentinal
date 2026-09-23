const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const isFiltered = stateFilter || sectorFilter || ministryFilter || (currentUser && currentUser.role !== "admin");',
  'const isFiltered = stateFilter || sectorFilter || ministryFilter || (currentUser && currentUser.role !== "admin" && currentUser.role !== "user");'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed isFiltered for users");
