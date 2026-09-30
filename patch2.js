const fs = require('fs');

let code = fs.readFileSync('src/components/AgencyProjectManager.tsx', 'utf8');
if (!code.includes('BRICS_STATES')) {
    code = code.replace('import { Save } from "lucide-react";', 'import { Save } from "lucide-react";\nimport { BRICS_STATES, COUNTRIES } from "@/lib/constants";');
    code = code.replace(/\{STATES\.map\(\(state\) => \(/g, '{((currentUser?.country && BRICS_STATES[currentUser.country]) || BRICS_STATES["India"]).map((state) => (');
    fs.writeFileSync('src/components/AgencyProjectManager.tsx', code, 'utf8');
}
