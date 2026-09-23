const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const TAB_ITEMS = \[[\s\S]*?\];/;
const newTabItems = `const TAB_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "proposals", label: "Bidding / Project Addition" },
  { id: "my-projects", label: "My Projects" },
  { id: "agency", label: "Agency Leaderboard" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "risk", label: "Risk Prediction" },
  { id: "alerts", label: "Alerts & Actions" },
];`;

content = content.replace(regex, newTabItems);

fs.writeFileSync(path, content, 'utf8');
console.log("Regex replaced TAB_ITEMS!");
