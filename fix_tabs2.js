const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('label: "Bidding & Proposals"', 'label: "Bidding / Project Addition"');

fs.writeFileSync(path, content, 'utf8');
console.log("Renamed Proposals tab to Bidding / Project Addition");
