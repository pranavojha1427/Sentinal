const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

const replacement = \    const REGION_MAPPING: Record<string, string[]> = {
      "sverdlovsk": ["yekaterinburg"],
      "bashkortostan": ["ufa"],
      "udmurt": ["izhevsk"],
      "altay": ["barnaul", "altai"],
      "primor'ye": ["vladivostok", "primorsky"],
      "rostov": ["rostov-on-don"],
      "nizhegorod": ["nizhny novgorod"],
      "perm'": ["perm"],
      "city of st. petersburg": ["saint petersburg"],
      "moskva": ["moscow"],
      "moskovsskaya": ["moscow"],
      "ul'yanovsk": ["ulyanovsk"],
      "tyumen'": ["tyumen"],
      "yaroslavl'": ["yaroslavl"],
      "samara": ["tolyatti", "samara"]
    };

    const getRiskScore = useCallback(
      (stateName: string) => {
        const sn = stateName.toLowerCase();
        const aliases = REGION_MAPPING[sn] || [];
        const matched = data.filter(
          (p) =>
            p.state &&
            (p.state.toLowerCase().includes(sn) ||
              sn.includes(p.state.toLowerCase()) || 
              aliases.some(a => p.state.toLowerCase().includes(a) || a.includes(p.state.toLowerCase())))
        );\;

code = code.replace(/    const getRiskScore = useCallback\([\s\S]*?sn\.includes\(p\.state\.toLowerCase\(\)\)\)\n        \);/, replacement);
fs.writeFileSync('src/components/StateRiskMap.tsx', code, 'utf8');
