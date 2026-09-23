const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add useEffect to imports if missing
if (!content.includes('useEffect')) {
  content = content.replace('useState, useMemo, Suspense', 'useState, useMemo, Suspense, useEffect');
  content = content.replace('useState, useMemo', 'useState, useMemo, useEffect');
}

// 2. Add debouncedSearchQuery state and useEffect
const searchState = 'const [searchQuery, setSearchQuery] = useState("");';
const debouncedState = `const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);`;
content = content.replace(searchState, debouncedState);

// 3. Update searchedProjects to use debouncedSearchQuery
const filterMemo = `const searchedProjects = useMemo(() => {
    if (!searchQuery) return mappedProjects;
    const q = searchQuery.toLowerCase();`;
const newFilterMemo = `const searchedProjects = useMemo(() => {
    if (!debouncedSearchQuery) return mappedProjects;
    const q = debouncedSearchQuery.toLowerCase();`;
content = content.replace(filterMemo, newFilterMemo);

const depsTarget = `}, [mappedProjects, searchQuery]);`;
const newDepsTarget = `}, [mappedProjects, debouncedSearchQuery]);`;
content = content.replace(depsTarget, newDepsTarget);

fs.writeFileSync(path, content, 'utf8');
console.log("Applied debounce fix!");
