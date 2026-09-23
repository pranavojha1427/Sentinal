const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add searchQuery state if missing
if (!content.includes('const [searchQuery, setSearchQuery]')) {
  content = content.replace(
    'const [activeTab, setActiveTab] = useState<string>("dashboard");',
    'const [activeTab, setActiveTab] = useState<string>("dashboard");\n  const [searchQuery, setSearchQuery] = useState("");'
  );
}

// 2. Add searchedProjects useMemo if missing
if (!content.includes('const searchedProjects = useMemo(')) {
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
}

// 3. Update the Card header with search input using Regex
const cardHeaderRegex = /<CardHeader>\s*<CardTitle className="font-mono uppercase tracking-wide border-b border-slate-200 pb-2\s*text-slate-900">Project Database<\/CardTitle>\s*<\/CardHeader>\s*<CardContent className="p-0">\s*<ProjectTableAI projects=\{mappedProjects\}\s*\/>\s*<\/CardContent>/;

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
                </div>
              </CardHeader>
              <CardContent className="p-0"><ProjectTableAI projects={searchedProjects} /></CardContent>`;

if (cardHeaderRegex.test(content)) {
    content = content.replace(cardHeaderRegex, replacementCardHeader);
    console.log("Successfully replaced the CardHeader and injected Search!");
} else {
    console.log("Regex did not match. File contents around Project Database:");
    console.log(content.substring(content.indexOf("Project Database") - 100, content.indexOf("Project Database") + 200));
}

fs.writeFileSync(path, content, 'utf8');
