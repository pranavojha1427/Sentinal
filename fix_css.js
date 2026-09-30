const fs = require('fs');
let code = fs.readFileSync('src/app/globals.css', 'utf8');
code = code.replace('@import "tw-animate-css";', '@import "tw-animate-css/dist/tw-animate.css";');
fs.writeFileSync('src/app/globals.css', code);
