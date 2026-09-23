const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find mappedProjects definition and inject searchedProjects after the closing brace of its useMemo
const regex = /mappedProjects: mapped\s*};\s*}, \[filteredProjects\]\);/;
if (regex.test(content)) {
  content = content.replace(regex, `mappedProjects: mapped\n    };\n  }, [filteredProjects]);\n\n  const searchedProjects = useMemo(() => {\n    if (!searchQuery) return mappedProjects;\n    const q = searchQuery.toLowerCase();\n    return mappedProjects.filter(p => \n      (p.project_name && p.project_name.toLowerCase().includes(q)) || \n      (p.project_code && p.project_code.toLowerCase().includes(q))\n    );\n  }, [mappedProjects, searchQuery]);`);
  console.log("Injected searchedProjects correctly!");
} else {
  console.log("Regex did not match.");
}
fs.writeFileSync(path, content, 'utf8');
