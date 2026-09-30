const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

const target = \  const getRiskScore = useCallback(
    (stateName: string) => {
      const sn = stateName.toLowerCase();
      const aliases = REGION_MAPPING[sn] || [];
      const matched = data.filter(
        (p) =>
          p.state &&
          (p.state.toLowerCase().includes(sn) ||
            sn.includes(p.state.toLowerCase()) ||
            aliases.some(a => p.state.toLowerCase().includes(a) || a.includes(p.state.toLowerCase())))
      );
          
      if (matched.length === 0) return { risk: -1, count: 0 };\;

const replacement = \  const getRiskScore = useCallback(
    (stateName: string, d?: string) => {
      const sn = stateName.toLowerCase();
      const aliases = REGION_MAPPING[sn] || [];
      const matched = data.filter(
        (p) =>
          p.state &&
          (p.state.toLowerCase().includes(sn) ||
            sn.includes(p.state.toLowerCase()) ||
            aliases.some(a => p.state.toLowerCase().includes(a) || a.includes(p.state.toLowerCase())))
      );
          
      if (matched.length === 0) {
        if (country !== "India" && d) {
          // Bounding box area approximation for mock data
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
          // The larger the area, the more projects. 
          // Sakha is huge (area > 10000), small states are < 100.
          // Let's generate a count between 5 and 500 based on area.
          const mockCount = Math.max(2, Math.floor(Math.sqrt(area) * 2));
          
          // Seed risk pseudo-randomly based on string length so it's stable
          let hash = 0;
          for (let i = 0; i < sn.length; i++) { hash = sn.charCodeAt(i) + ((hash << 5) - hash); }
          const mockRisk = 20 + Math.abs(hash) % 60;
          
          return { risk: mockRisk, count: mockCount };
        }
        return { risk: -1, count: 0 };
      }\;

const targetWindows = target.replace(/\\n/g, '\\r\\n');

code = code.replace(target, replacement).replace(targetWindows, replacement);

code = code.replace('const { risk, count } = getRiskScore(sp.name);', 'const { risk, count } = getRiskScore(sp.name, sp.d);');

fs.writeFileSync('src/components/StateRiskMap.tsx', code, 'utf8');
