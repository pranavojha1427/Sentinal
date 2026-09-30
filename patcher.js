const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

if (!code.includes('BRICS_STATES')) {
  code = code.replace('import type { FeatureCollection, Feature, Geometry } from "geojson";', 'import type { FeatureCollection, Feature, Geometry } from "geojson";\nimport { BRICS_STATES } from "@/lib/constants";');
}

const urlTarget = `    if (country === "All") {
        setStatePaths([]);
        setLoading(false);
        return;
      }
      if (country !== "India") {
      let hcPrefix = "";
      let geoUrl = "";
      
      if (country === "China") {
        geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/china.geojson";
      } else {
        if (country === "Russia") hcPrefix = "ru";
        else if (country === "Brazil") hcPrefix = "br";
        else if (country === "South Africa") hcPrefix = "za";
        
        if (hcPrefix) {
          geoUrl = \`https://code.highcharts.com/mapdata/countries/\${hcPrefix}/\${hcPrefix}-all.geo.json\`;
        }
      }
    }
    if (!geoUrl) {`;

const urlRep = `    let geoUrl = "";
    if (country === "All") {
      geoUrl = "https://code.highcharts.com/mapdata/custom/world.geo.json";
    } else if (country !== "India") {
      let hcPrefix = "";
      if (country === "China") {
        geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/china.geojson";
      } else {
        if (country === "Russia") hcPrefix = "ru";
        else if (country === "Brazil") hcPrefix = "br";
        else if (country === "South Africa") hcPrefix = "za";
        
        if (hcPrefix) {
          geoUrl = \`https://code.highcharts.com/mapdata/countries/\${hcPrefix}/\${hcPrefix}-all.geo.json\`;
        }
      }
    }
    if (!geoUrl) {`;

code = code.replace(urlTarget, urlRep);
code = code.replace(urlTarget.replace(/\r\n/g, '\n'), urlRep);
code = code.replace(urlTarget.replace(/\n/g, '\r\n'), urlRep);


const riskTarget = `  const getRiskScore = useCallback(
    (stateName: string, d?: string) => {
      const sn = stateName.toLowerCase();
      const aliases = REGION_MAPPING[sn] || [];
      const matched = data.filter(
        (p) =>
          p.state &&
          (p.state.toLowerCase().includes(sn) ||
            sn.includes(p.state.toLowerCase()) ||
            aliases.some(a => p.state.toLowerCase().includes(a) || a.includes(p.state.toLowerCase())))
      );`;

const riskRep = `  const getRiskScore = useCallback(
    (stateName: string, d?: string) => {
      const sn = stateName.toLowerCase();
      let matched: any[] = [];
      if (country === "All") {
          if (!["India", "Brazil", "Russia", "China", "South Africa"].includes(stateName)) {
              return { risk: -1, count: 0 };
          }
          const targetCountryStates = BRICS_STATES[stateName] || [];
          matched = data.filter(p => {
              if (!p.state) return false;
              return targetCountryStates.some(s => s === p.state || p.state.toLowerCase().includes(s.toLowerCase()));
          });
      } else {
          const aliases = REGION_MAPPING[sn] || [];
          matched = data.filter(
            (p) =>
              p.state &&
              (p.state.toLowerCase().includes(sn) ||
                sn.includes(p.state.toLowerCase()) ||
                aliases.some(a => p.state.toLowerCase().includes(a) || a.includes(p.state.toLowerCase())))
          );
      }`;

code = code.replace(riskTarget, riskRep);
code = code.replace(riskTarget.replace(/\r\n/g, '\n'), riskRep);
code = code.replace(riskTarget.replace(/\n/g, '\r\n'), riskRep);


fs.writeFileSync('src/components/StateRiskMap.tsx', code, 'utf8');
