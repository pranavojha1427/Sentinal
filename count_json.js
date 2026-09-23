const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

let o = 0, r = 0, e = 0;
for (let p of data) {
    o += Number(p.original_cost_rs_crore) || 0;
    r += Number(p.revised_cost_rs_crore) || Number(p.original_cost_rs_crore) || 0;
    e += Number(p.cumulative_expenditure_rs_crore) || 0;
}
console.log(Original: , Revised: , Expenditure: );
