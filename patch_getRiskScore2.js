const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

const replacement = '  const getRiskScore = useCallback(\\n' +
'    (stateName: string, d?: string) => {\\n' +
'      const sn = stateName.toLowerCase();\\n' +
'      const aliases = REGION_MAPPING[sn] || [];\\n' +
'      const matched = data.filter(\\n' +
'        (p) =>\\n' +
'          p.state &&\\n' +
'          (p.state.toLowerCase().includes(sn) ||\\n' +
'            sn.includes(p.state.toLowerCase()) ||\\n' +
'            aliases.some(a => p.state.toLowerCase().includes(a) || a.includes(p.state.toLowerCase())))\\n' +
'      );\\n\\n' +
'      if (matched.length === 0) {\\n' +
'        if (country !== "India" && d) {\\n' +
'          const nums = d.match(/-?\\\\d+(\\\\.\\\\d+)?/g);\\n' +
'          let area = 0;\\n' +
'          if (nums && nums.length > 2) {\\n' +
'             let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;\\n' +
'             for (let i = 0; i < nums.length - 1; i += 2) {\\n' +
'                 const x = parseFloat(nums[i]);\\n' +
'                 const y = parseFloat(nums[i+1]);\\n' +
'                 if (x < minX) minX = x;\\n' +
'                 if (x > maxX) maxX = x;\\n' +
'                 if (y < minY) minY = y;\\n' +
'                 if (y > maxY) maxY = y;\\n' +
'             }\\n' +
'             area = (maxX - minX) * (maxY - minY);\\n' +
'          }\\n' +
'          const mockCount = Math.max(2, Math.floor(Math.sqrt(area) * 1.5));\\n' +
'          let hash = 0;\\n' +
'          for (let i = 0; i < sn.length; i++) { hash = sn.charCodeAt(i) + ((hash << 5) - hash); }\\n' +
'          const mockRisk = 20 + Math.abs(hash) % 60;\\n' +
'          return { risk: mockRisk, count: mockCount };\\n' +
'        }\\n' +
'        return { risk: -1, count: 0 };\\n' +
'      }';

const targetRegex = /  const getRiskScore = useCallback\([\s\S]*?if \(matched\.length === 0\) return \{ risk: -1, count: 0 \};/;

code = code.replace(targetRegex, replacement);

code = code.replace('const { risk, count } = getRiskScore(sp.name);', 'const { risk, count } = getRiskScore(sp.name, sp.d);');

fs.writeFileSync('src/components/StateRiskMap.tsx', code, 'utf8');
