const fs = require('fs');
let code = fs.readFileSync('src/components/AdminAccountManager.tsx', 'utf8');
code = code.replace(/const BRICS_STATES: Record<string, string\[\]> = \{[\s\S]*?\];/g, 'import { BRICS_STATES, COUNTRIES } from "@/lib/constants";');
fs.writeFileSync('src/components/AdminAccountManager.tsx', code, 'utf8');
