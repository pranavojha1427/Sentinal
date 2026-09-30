const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

const target = `      if (matched.length === 0) {
        if (country !== "India" && d) {
          const nums = d.match(/-?\\d+(\\.\\d+)?/g);
          let area = 0;
          if (nums && nums.length > 2) {
             let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
             for (let i = 0; i < nums.length - 1; i += 2) {
                 const x = parseFloat(nums[i]);
                 const y = parseFloat(nums[i+1]);
                 if (x < minX) minX = x;
                 if (x > maxX) maxX = x;
                 if (y < minY) minY = y;
                 if (y > maxY) maxY = y;
             }
             area = (maxX - minX) * (maxY - minY);
          }
          const mockCount = Math.max(2, Math.floor(Math.sqrt(area) * 3 + (area / 150)));
          let hash = 0;
          for (let i = 0; i < sn.length; i++) { hash = sn.charCodeAt(i) + ((hash << 5) - hash); }
          const mockRisk = 20 + Math.abs(hash) % 60;
          return { risk: mockRisk, count: mockCount };
        }
        return { risk: -1, count: 0 };
      }`;

const rep = `      if (matched.length === 0) {
        return { risk: -1, count: 0 };
      }`;

let code2 = code.replace(target, rep);
if (code2 === code) { code2 = code.replace(target.replace(/\n/g, '\r\n'), rep); }

fs.writeFileSync('src/components/StateRiskMap.tsx', code2, 'utf8');
