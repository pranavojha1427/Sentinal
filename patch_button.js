const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardClientView.tsx', 'utf8');

const target = `                <div className="flex items-end">
                  <button 
                    onClick={() => { setSectorFilter(null); setMinistryFilter(null); }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 text-sm font-mono h-[38px] px-4 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>`;

const rep = `                <div className="flex items-end w-full md:w-auto">
                  <button 
                    onClick={() => { setSectorFilter(null); setMinistryFilter(null); }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 text-sm font-mono h-[38px] px-4 transition-colors w-full md:w-auto mt-2 md:mt-0"
                  >
                    Clear Filters
                  </button>
                </div>`;

let code2 = code.replace(target, rep);
if (code2 === code) { code2 = code.replace(target.replace(/\n/g, '\r\n'), rep); }

fs.writeFileSync('src/components/DashboardClientView.tsx', code2, 'utf8');
