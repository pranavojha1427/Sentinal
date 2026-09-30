const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardClientView.tsx', 'utf8');

// 1. Padding
code = code.replace(/className="p-8 bg-slate-50/g, 'className="p-3 sm:p-5 md:p-8 bg-slate-50');

// 2. Title
code = code.replace(/text-4xl font-bold/g, 'text-3xl md:text-4xl font-bold');

// 3. Header Buttons Padding
code = code.replace(/px-4 py-2/g, 'px-3 py-2 sm:px-4 sm:py-2');

// 4. Tab scrollbar hiding
code = code.replace(/className="flex gap-1 border-b border-slate-200 mb-8 overflow-x-auto"/g, 'className="flex gap-1 border-b border-slate-200 mb-6 md:mb-8 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"');

// 5. Map Height
code = code.replace(/<div className="h-\[400px\]/g, '<div className="h-[300px] md:h-[400px]');
code = code.replace(/<Suspense fallback={<div className="h-\[300px\] md:h-\[400px\] flex items-center justify-center text-slate-500 font-mono">Loading Map...<\/div>}>/g, '<Suspense fallback={<div className="h-[300px] md:h-[400px] flex items-center justify-center text-slate-500 font-mono">Loading Map...</div>}>');

fs.writeFileSync('src/components/DashboardClientView.tsx', code, 'utf8');
