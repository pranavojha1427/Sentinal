const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

const target = `          const mockCount = Math.max(2, Math.floor(Math.sqrt(area) * 1.5));`;
const rep = `          const mockCount = Math.max(2, Math.floor(Math.sqrt(area) * 3 + (area / 150)));`;

let code2 = code.replace(target, rep);
if (code2 === code) { code2 = code.replace(target.replace(/\n/g, '\r\n'), rep); }

fs.writeFileSync('src/components/StateRiskMap.tsx', code2, 'utf8');
