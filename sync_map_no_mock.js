const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

const target1 = `      if (country === "All") {
          if (!["India", "Brazil", "Russia", "China", "South Africa"].includes(stateName)) {
              return { risk: -1, count: 0 };
          }
          const targetCountryStates = BRICS_STATES[stateName] || [];
          matched = data.filter(p => {
              if (!p.state) return false;
              return targetCountryStates.some(s => s === p.state || p.state.toLowerCase().includes(s.toLowerCase()));
          });
      }`;

const rep1 = `      if (country === "All") {
          if (!["India", "Brazil", "Russia", "China", "South Africa"].includes(stateName)) {
              return { risk: -1, count: 0 };
          }
          matched = data.filter(p => {
              let pCountry = 'India';
              if (p.state) {
                  for (const [c, bricsStates] of Object.entries(BRICS_STATES)) {
                      if (bricsStates.some((bs: string) => p.state.includes(bs) || bs.includes(p.state))) {
                          pCountry = c;
                          break;
                      }
                  }
              }
              return pCountry === stateName;
          });
      }`;

const target2 = `      if (matched.length === 0) {
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

const rep2 = `      if (matched.length === 0) {
        return { risk: -1, count: 0 };
      }`;

let code2 = code.replace(target1, rep1);
if (code2 === code) { code2 = code.replace(target1.replace(/\n/g, '\r\n'), rep1); }

let code3 = code2.replace(target2, rep2);
if (code3 === code2) { code3 = code2.replace(target2.replace(/\n/g, '\r\n'), rep2); }

fs.writeFileSync('src/components/StateRiskMap.tsx', code3, 'utf8');
