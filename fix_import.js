const fs = require('fs');
const path = 'src/app/api/proposals/route.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { createClient }')) {
  content = `import { createClient } from "@/utils/supabase/server";\n` + content;
  fs.writeFileSync(path, content, 'utf8');
}
console.log("Fixed import");
