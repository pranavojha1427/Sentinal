const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

const target = `      if (country === "All") {
          if (!["India", "Brazil", "Russia", "China", "South Africa"].includes(stateName)) {
              return { risk: -1, count: 0 };
          }
          const targetCountryStates = BRICS_STATES[stateName] || [];
          matched = data.filter(p => {
              if (!p.state) return false;
              return targetCountryStates.some(s => s === p.state || p.state.toLowerCase().includes(s.toLowerCase()));
          });
      }`;

const rep = `      if (country === "All") {
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

let code2 = code.replace(target, rep);
if (code2 === code) { code2 = code.replace(target.replace(/\n/g, '\r\n'), rep); }

fs.writeFileSync('src/components/StateRiskMap.tsx', code2, 'utf8');
