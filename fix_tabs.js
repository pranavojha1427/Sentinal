const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldTabItems = `const TAB_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "agency", label: "Agency Leaderboard" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "risk", label: "Risk Prediction" },
  { id: "alerts", label: "Alerts & Actions" },
];`;

const newTabItems = `const TAB_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "proposals", label: "Bidding & Proposals" },
  { id: "my-projects", label: "My Projects" },
  { id: "agency", label: "Agency Leaderboard" },
  { id: "benchmarks", label: "Benchmarks" },
  { id: "risk", label: "Risk Prediction" },
  { id: "alerts", label: "Alerts & Actions" },
];`;

content = content.replace(oldTabItems, newTabItems);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed TAB_ITEMS array in DashboardClientView.tsx");
