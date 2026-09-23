const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const anchor = `      mappedProjects: mapped
    };
  }, [filteredProjects]);`;

const replacement = `      mappedProjects: mapped
    };
  }, [filteredProjects]);

  const searchedProjects = useMemo(() => {
    if (!searchQuery) return mappedProjects;
    const q = searchQuery.toLowerCase();
    return mappedProjects.filter(p => 
      (p.project_name && p.project_name.toLowerCase().includes(q)) || 
      (p.project_code && p.project_code.toLowerCase().includes(q))
    );
  }, [mappedProjects, searchQuery]);`;

content = content.replace(anchor, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log("Injected searchedProjects definition!");
