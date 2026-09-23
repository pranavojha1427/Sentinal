const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add searchQuery state
content = content.replace(
  'const [activeTab, setActiveTab] = useState<string>("dashboard");',
  'const [activeTab, setActiveTab] = useState<string>("dashboard");\n  const [searchQuery, setSearchQuery] = useState("");'
);

// 2. Add searchedProjects useMemo
const mappedProjectsMatch = `    }, [filteredProjects]);`;
const searchedProjectsInject = `    }, [filteredProjects]);

  const searchedProjects = useMemo(() => {
    if (!searchQuery) return mappedProjects;
    const q = searchQuery.toLowerCase();
    return mappedProjects.filter(p => 
      (p.project_name && p.project_name.toLowerCase().includes(q)) || 
      (p.project_code && p.project_code.toLowerCase().includes(q))
    );
  }, [mappedProjects, searchQuery]);`;
content = content.replace(mappedProjectsMatch, searchedProjectsInject);

// 3. Update the Card header with search input and replace mappedProjects with searchedProjects
const targetCardHeader = `<CardHeader><CardTitle className="font-mono uppercase tracking-wide border-b border-slate-200 pb-2 text-slate-900">Project Database</CardTitle></CardHeader>
              <CardContent className="p-0"><ProjectTableAI projects={mappedProjects} /></CardContent>`;

const replacementCardHeader = `<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <CardTitle className="font-mono uppercase tracking-wide text-slate-900">Project Database</CardTitle>
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-700 px-3 py-2 text-sm font-mono focus:border-emerald-500 outline-none"
                  />
                  <svg className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent className="p-0"><ProjectTableAI projects={searchedProjects} /></CardContent>`;

content = content.replace(targetCardHeader, replacementCardHeader);

fs.writeFileSync(path, content, 'utf8');
console.log("Added search bar logic");
