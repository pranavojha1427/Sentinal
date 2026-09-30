const fs = require('fs');
let code = fs.readFileSync('src/components/AdminInspectors.tsx', 'utf8');

code = code.replace(/<option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands<\/option>[\s\S]*?<option value="West Bengal">West Bengal<\/option>/, 
{((currentUser?.country && BRICS_STATES[currentUser.country]) || BRICS_STATES["India"]).map(s => <option key={s} value={s}>{s}</option>)});

if (!code.includes('BRICS_STATES')) {
    code = code.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { BRICS_STATES, COUNTRIES } from "@/lib/constants";');
}

fs.writeFileSync('src/components/AdminInspectors.tsx', code, 'utf8');
