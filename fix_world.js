const fs = require("fs");
let code = fs.readFileSync("src/components/StateRiskMap.tsx", "utf8");

let startIdx = code.indexOf("    if (country === \"All\") {");
let endIdx = code.indexOf("    if (!geoUrl) {");

let replacement = `    let geoUrl = "";
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
`;
code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync("src/components/StateRiskMap.tsx", code, "utf8");

