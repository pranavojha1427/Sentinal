const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

const target = `    if (country === "All") {
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
      
      if (!geoUrl) {`;

const rep = `    let geoUrl = "";
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

let code2 = code.replace(target, rep);
if (code2 === code) {
  code2 = code.replace(target.replace(/\n/g, '\r\n'), rep);
}

fs.writeFileSync('src/components/StateRiskMap.tsx', code2, 'utf8');
