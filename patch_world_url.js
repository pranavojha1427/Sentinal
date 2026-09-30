const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

const regex = /    if \(country === "All"\) {[\s\S]*?if \(!geoUrl\) {/m;

const replacement = \    let geoUrl = "";
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
    }
    if (!geoUrl) {\;

code = code.replace(regex, replacement);

// One more fix: for World Map, the coordinates might not be projected Cartesian or long/lat correctly in our logic.
// Highcharts world map coordinates: let's force isProjected = false for world map, wait, Highcharts world map coordinates are typically projected (Cartesian, very large numbers).
// Our logic: if (Math.abs(coords[0]) > 180) { isProjected = true; }
// This usually works for Highcharts because their X/Y coordinates are large integers (e.g. 5000, 10000).

fs.writeFileSync('src/components/StateRiskMap.tsx', code, 'utf8');
