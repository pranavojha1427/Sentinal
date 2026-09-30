const fs = require('fs');
let code = fs.readFileSync('src/components/StateRiskMap.tsx', 'utf8');

// 1. Legend padding and text size
code = code.replace(
  /className="absolute top-4 left-4 z-10 bg-white border border-slate-300 p-4 rounded-lg shadow-lg"/g,
  'className="absolute top-2 left-2 md:top-4 md:left-4 z-10 bg-white/90 md:bg-white border border-slate-300 p-2 md:p-4 rounded shadow-lg pointer-events-none md:pointer-events-auto max-w-[200px] md:max-w-xs"'
);
code = code.replace(
  /className="text-slate-800 font-semibold mb-3 font-serif"/g,
  'className="text-slate-800 font-semibold mb-1 md:mb-3 font-serif text-sm md:text-base"'
);
code = code.replace(
  /className="flex flex-row items-center gap-4 text-sm text-slate-600"/g,
  'className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-4 text-xs md:text-sm text-slate-600"'
);

// 2. Map height
code = code.replace(/style={{ maxHeight: 720 }}/g, 'style={{ maxHeight: 720, width: "100%", height: "auto" }}');

fs.writeFileSync('src/components/StateRiskMap.tsx', code, 'utf8');
