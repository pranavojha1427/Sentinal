const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = 'TAB_ITEMS.filter(tab => (tab.id !== "my-projects" || currentUser?.role === "agency"))';
const replacementStr = 'TAB_ITEMS.filter(tab => (tab.id !== "my-projects" || currentUser?.role === "agency") && (tab.id !== "agency" || currentUser?.role !== "agency"))';

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully removed Agency Leaderboard tab for agency users.");
} else {
    console.log("Target string not found!");
}
