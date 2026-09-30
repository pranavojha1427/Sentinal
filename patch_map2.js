const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

const target = '  const getRiskScore = useCallback(\n' +
'    (stateName: string) => {\n' +
'      const sn = stateName.toLowerCase();\n' +
'      const matched = data.filter(\n' +
'        (p) =>\n' +
'          p.state &&\n' +
'          (p.state.toLowerCase().includes(sn) ||\n' +
'            sn.includes(p.state.toLowerCase()))\n' +
'      );';

const targetWindows = target.replace(/\n/g, '\r\n');

const replacement = '  const REGION_MAPPING: Record<string, string[]> = {\n' +
'    "sverdlovsk": ["yekaterinburg"],\n' +
'    "bashkortostan": ["ufa"],\n' +
'    "udmurt": ["izhevsk"],\n' +
'    "altay": ["barnaul", "altai"],\n' +
'    "primor\'ye": ["vladivostok", "primorsky"],\n' +
'    "rostov": ["rostov-on-don"],\n' +
'    "nizhegorod": ["nizhny novgorod"],\n' +
'    "perm\'": ["perm"],\n' +
'    "city of st. petersburg": ["saint petersburg"],\n' +
'    "moskva": ["moscow"],\n' +
'    "moskovsskaya": ["moscow"],\n' +
'    "ul\'yanovsk": ["ulyanovsk"],\n' +
'    "tyumen\'": ["tyumen"],\n' +
'    "yaroslavl\'": ["yaroslavl"],\n' +
'    "samara": ["tolyatti", "samara"]\n' +
'  };\n\n' +
'  const getRiskScore = useCallback(\n' +
'    (stateName: string) => {\n' +
'      const sn = stateName.toLowerCase();\n' +
'      const aliases = REGION_MAPPING[sn] || [];\n' +
'      const matched = data.filter(\n' +
'        (p) =>\n' +
'          p.state &&\n' +
'          (p.state.toLowerCase().includes(sn) ||\n' +
'            sn.includes(p.state.toLowerCase()) ||\n' +
'            aliases.some(a => p.state.toLowerCase().includes(a) || a.includes(p.state.toLowerCase())))\n' +
'      );';

let newCode = code.replace(target, replacement).replace(targetWindows, replacement);
fs.writeFileSync('src/components/StateRiskMap.tsx', newCode, 'utf8');
