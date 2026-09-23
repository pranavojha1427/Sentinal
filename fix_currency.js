const fs = require('fs');

const f1 = 'src/components/BiddingBoard.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace('?${bid.bidAmount}', '?${bid.bidAmount}');
c1 = c1.replace('?{b.bidAmount}', '?{b.bidAmount}');
fs.writeFileSync(f1, c1, 'utf8');

const f2 = 'src/components/WorkflowInbox.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace('?{p.expected_expenditure}', '?{p.expected_expenditure}');
fs.writeFileSync(f2, c2, 'utf8');

console.log("Fixed ? to ?");
