const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

// Add import
if (!code.includes('BRICS_STATES')) {
  code = code.replace('import type { FeatureCollection, Feature, Geometry } from "geojson";', 
    'import type { FeatureCollection, Feature, Geometry } from "geojson";\nimport { BRICS_STATES } from "@/lib/constants";');
}

// Modify useEffect logic
code = code.replace(/    if \(country === "All"\) {\r?\n\s*setStatePaths\(\[\]\);\r?\n\s*setLoading\(false\);\r?\n\s*return;\r?\n\s*}/, 
\    if (country === "All") {
      geoUrl = "https://code.highcharts.com/mapdata/custom/world.geo.json";
    }\);
    
// The geoUrl declaration is inside the if (country !== "India")
// Let's rewrite the URL logic entirely:
const urlLogicTarget = \    if (country === "All") {
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
          geoUrl = \\\https://code.highcharts.com/mapdata/countries/\\\/\\\-all.geo.json\\\;
        }
      }\;

const urlLogicReplacement = \    let geoUrl = "";
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
          geoUrl = \\\https://code.highcharts.com/mapdata/countries/\\\/\\\-all.geo.json\\\;
        }
      }
    }\;

code = code.replace(urlLogicTarget, urlLogicReplacement);
code = code.replace(urlLogicTarget.replace(/\r\n/g, '\\n'), urlLogicReplacement);

// Now rewrite getRiskScore
const riskScoreTarget = \  const getRiskScore = useCallback(
    (stateName: string, d?: string) => {
      const sn = stateName.toLowerCase();
      const aliases = REGION_MAPPING[sn] || [];
      const matched = data.filter(
        (p) =>
          p.state &&
          (p.state.toLowerCase().includes(sn) ||
            sn.includes(p.state.toLowerCase()) ||
            aliases.some(a => p.state.toLowerCase().includes(a) || a.includes(p.state.toLowerCase())))
      );\;
      
const riskScoreReplacement = \  const getRiskScore = useCallback(
    (stateName: string, d?: string) => {
      const sn = stateName.toLowerCase();
      let matched = [];
      
      if (country === "All") {
          // If stateName is not one of BRICS countries, don't color it (risk: -1)
          if (!["India", "Brazil", "Russia", "China", "South Africa"].includes(stateName)) {
              return { risk: -1, count: 0 };
          }
          const targetCountryStates = BRICS_STATES[stateName] || [];
          matched = data.filter(p => {
              if (!p.state) return false;
              // Fuzzy match state to see if it belongs to this country
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
      }\;

code = code.replace(riskScoreTarget, riskScoreReplacement);
code = code.replace(riskScoreTarget.replace(/\r\n/g, '\\n'), riskScoreReplacement);


// Remove the big DYO placeholder section in the render logic if needed, but actually it will just render SVG because statePaths.length > 0!
// Wait! isProjected logic needs fixing for the world map!
// The world map from highcharts has projected coordinates already, or maybe long/lat?
// Let's check how the world map renders. If it uses Highcharts projection, it might need geoIdentity().
// Our existing logic checks if (Math.abs(coords[0]) > 180). For Highcharts world map, it's probably projected.

fs.writeFileSync('src/components/StateRiskMap.tsx', code, 'utf8');
