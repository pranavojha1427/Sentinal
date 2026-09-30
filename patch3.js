const fs = require('fs');
let code = fs.readFileSync('src/components/ProposalForm.tsx', 'utf8');
if (!code.includes('BRICS_STATES')) {
    code = code.replace('import { Button } from "./ui/button";', 'import { Button } from "./ui/button";\nimport { BRICS_STATES, COUNTRIES } from "@/lib/constants";');
    fs.writeFileSync('src/components/ProposalForm.tsx', code, 'utf8');
}
