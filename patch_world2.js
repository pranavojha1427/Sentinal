const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

if (!code.includes('BRICS_STATES')) {
  code = code.replace('import type { FeatureCollection, Feature, Geometry } from "geojson";', 
    'import type { FeatureCollection, Feature, Geometry } from "geojson";\nimport { BRICS_STATES } from "@/lib/constants";');
}

let urlTarget = '    if (country === "All") {\n' +
'        setStatePaths([]);\n' +
'        setLoading(false);\n' +
'        return;\n' +
'      }\n' +
'      if (country !== "India") {\n' +
'      let hcPrefix = "";\n' +
'      let geoUrl = "";\n' +
'      \n' +
'      if (country === "China") {\n' +
'        geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/china.geojson";\n' +
'      } else {\n' +
'        if (country === "Russia") hcPrefix = "ru";\n' +
'        else if (country === "Brazil") hcPrefix = "br";\n' +
'        else if (country === "South Africa") hcPrefix = "za";\n' +
'        \n' +
'        if (hcPrefix) {\n' +
'          geoUrl = https://code.highcharts.com/mapdata/countries//-all.geo.json;\n' +
'        }\n' +
'      }';

let urlRep = '    let geoUrl = "";\n' +
'    if (country === "All") {\n' +
'      geoUrl = "https://code.highcharts.com/mapdata/custom/world.geo.json";\n' +
'    } else if (country !== "India") {\n' +
'      let hcPrefix = "";\n' +
'      if (country === "China") {\n' +
'        geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/china.geojson";\n' +
'      } else {\n' +
'        if (country === "Russia") hcPrefix = "ru";\n' +
'        else if (country === "Brazil") hcPrefix = "br";\n' +
'        else if (country === "South Africa") hcPrefix = "za";\n' +
'        \n' +
'        if (hcPrefix) {\n' +
'          geoUrl = https://code.highcharts.com/mapdata/countries//-all.geo.json;\n' +
'        }\n' +
'      }\n' +
'    }\n' +
'    if (country === "All") {\n' +
'        // Just making sure it passes the !geoUrl check\n' +
'    } else ';

code = code.replace(urlTarget, urlRep);
code = code.replace(urlTarget.replace(/\n/g, '\r\n'), urlRep);

let riskTarget = '  const getRiskScore = useCallback(\n' +
'    (stateName: string, d?: string) => {\n' +
'      const sn = stateName.toLowerCase();\n' +
'      const aliases = REGION_MAPPING[sn] || [];\n' +
'      const matched = data.filter(\n' +
'        (p) =>\n' +
'          p.state &&\n' +
'          (p.state.toLowerCase().includes(sn) ||\n' +
'            sn.includes(p.state.toLowerCase()) ||\n' +
'            aliases.some(a => p.state.toLowerCase().includes(a) || a.includes(p.state.toLowerCase())))\n' +
'      );';

let riskRep = '  const getRiskScore = useCallback(\n' +
'    (stateName: string, d?: string) => {\n' +
'      const sn = stateName.toLowerCase();\n' +
'      let matched: any[] = [];\n' +
'      if (country === "All") {\n' +
'          if (!["India", "Brazil", "Russia", "China", "South Africa"].includes(stateName)) {\n' +
'              return { risk: -1, count: 0 };\n' +
'          }\n' +
'          const targetCountryStates = BRICS_STATES[stateName] || [];\n' +
'          matched = data.filter(p => {\n' +
'              if (!p.state) return false;\n' +
'              return targetCountryStates.some(s => s === p.state || p.state.toLowerCase().includes(s.toLowerCase()));\n' +
'          });\n' +
'      } else {\n' +
'          const aliases = REGION_MAPPING[sn] || [];\n' +
'          matched = data.filter(\n' +
'            (p) =>\n' +
'              p.state &&\n' +
'              (p.state.toLowerCase().includes(sn) ||\n' +
'                sn.includes(p.state.toLowerCase()) ||\n' +
'                aliases.some(a => p.state.toLowerCase().includes(a) || a.includes(p.state.toLowerCase())))\n' +
'          );\n' +
'      }';

code = code.replace(riskTarget, riskRep);
code = code.replace(riskTarget.replace(/\n/g, '\r\n'), riskRep);

fs.writeFileSync('src/components/StateRiskMap.tsx', code, 'utf8');
