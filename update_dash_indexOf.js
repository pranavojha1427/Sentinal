const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const startStr = '<div className="flex flex-col gap-1 w-full md:w-auto flex-1 min-w-[200px]">';
let idx = content.indexOf(startStr);

// We need the SECOND occurrence of this startStr because the first one is for the Sector filter!
let firstIdx = content.indexOf(startStr);
let secondIdx = content.indexOf(startStr, firstIdx + 1);

if (secondIdx !== -1) {
    // Find the end of this div block
    const selectEnd = content.indexOf('</select>', secondIdx);
    const divEnd = content.indexOf('</div>', selectEnd) + 6;

    const block = content.substring(secondIdx, divEnd);
    if (block.includes('Ministry / Department')) {
        const newBlock = `{currentUser?.role !== "ministry" && (\n  ` + block + `\n)}`;
        content = content.substring(0, secondIdx) + newBlock + content.substring(divEnd);
        console.log("Successfully wrapped Ministry / Department block!");
        fs.writeFileSync(path, content, 'utf8');
    } else {
        console.log("Found block was not Ministry / Department");
    }
} else {
    console.log("Could not find second occurrence.");
}
