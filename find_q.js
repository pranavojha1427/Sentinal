const fs = require('fs');
const walk = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const p = dir + '/' + file;
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.py')) {
      const c = fs.readFileSync(p, 'utf8');
      if (c.includes('?')) {
        // We only want to replace '?' if it precedes a number or ${ variable or is standalone currency.
        // Actually, the prompt says "replace the ? to rupees sign please".
        // Often '?' is used for optional chaining (?.), ternaries ( ? : ), URL queries (?id=).
        // BUT they likely mean literal '?' used in strings like "?100 Cr" or "?${bidAmount}".
        const lines = c.split('\n');
        lines.forEach((l, i) => {
           if (l.match(/\?[\d\$]/)) {
             console.log(`[${p}:${i+1}] ${l.trim()}`);
           }
        });
      }
    }
  });
};
walk('src');
