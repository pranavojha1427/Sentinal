const fs = require('fs');

function patch(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('const STATES = [')) {
    code = code.replace(/const STATES = \[\s*[\s\S]*?\];/g, '');
    code = code.replace(/import \{.*\} from 'react';/, "import { useState, FormEvent } from 'react';\nimport { BRICS_STATES, COUNTRIES } from '@/lib/constants';");
    code = code.replace(/import React, \{.*\} from 'react';/, "import React, { useState, FormEvent, useEffect } from 'react';\nimport { BRICS_STATES, COUNTRIES } from '@/lib/constants';");
    
    if (file.includes('ProposalForm')) {
       // ProposalForm doesn't use country, just state. But we can deduce state from currentUser.
       code = code.replace(/\{STATES\.map\(\(state\) => \(/g, '{((currentUser?.country && BRICS_STATES[currentUser.country]) || BRICS_STATES["India"]).map((state) => (');
    }
  }
  fs.writeFileSync(file, code, 'utf8');
}
patch('src/components/ProposalForm.tsx');
patch('src/components/AgencyProjectManager.tsx');
