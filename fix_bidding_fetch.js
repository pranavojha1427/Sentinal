const fs = require('fs');
const path = 'src/components/BiddingBoard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'await fetch("/api/proposals", { method: "PUT", body: JSON.stringify({ id: proposal._id, action: "award_bid", feedback: `Bid awarded to ${bid.agencyName} for \u20B9${bid.bidAmount} Cr.` }) });',
  'await fetch("/api/proposals", { method: "PUT", body: JSON.stringify({ id: proposal._id, action: "award_bid", agency: bid.agencyName, bidAmount: bid.bidAmount, feedback: `Bid awarded to ${bid.agencyName} for \u20B9${bid.bidAmount} Cr.` }) });'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed BiddingBoard.tsx fetch");
