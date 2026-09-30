const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');
code = code.replace(/-?\\\\d\+\(\\\\\.\\\\d\+\)\?/g, '-?\\d+(\\.\\d+)?');
fs.writeFileSync('src/components/StateRiskMap.tsx', code, 'utf8');
