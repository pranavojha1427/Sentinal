const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardClientView.tsx', 'utf8');

const target = `  const projectsWithMinistry = useMemo(() => {
    return allProjects.map(p => ({ ...p, ministry: getMinistry(p.sector, p.agency, p.project_name, p.original_cost, p.ministry) }));
  }, [allProjects]);`;

const rep = `  const projectsWithMinistry = useMemo(() => {
    // Generate realistic mock data for non-India BRICS nations so the dashboard is fully populated
    const mockProjects: any[] = [];
    const sectors = ["Roads and Highways", "Power", "Health", "Urban Development", "Telecommunications"];
    
    // Simple deterministic random
    let seed = 12345;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (const [c, states] of Object.entries(BRICS_STATES)) {
        if (c === "India") continue;
        states.forEach(state => {
            // Larger states get more projects based on string length as a deterministic pseudo-random factor
            const baseCount = 2 + (state.length % 5);
            const num = baseCount + Math.floor(rand() * 10);
            
            for(let i=0; i<num; i++) {
                const sector = sectors[Math.floor(rand() * sectors.length)];
                mockProjects.push({
                   id: \`mock-\${c}-\${state}-\${i}\`,
                   project_name: \`\${state} \${sector} Initiative Phase \${i+1}\`,
                   project_code: \`BRICS-\${c.substring(0,2).toUpperCase()}-\${Math.floor(rand()*10000)}\`,
                   state: state,
                   sector: sector,
                   agency: \`State Agency of \${state}\`,
                   original_cost: 10 + rand()*500,
                   revised_cost: 10 + rand()*600,
                   physical_progress: 10 + rand()*90,
                   ministry: null
                });
            }
        });
    }
    
    const combined = [...allProjects, ...mockProjects];
    return combined.map(p => ({ ...p, ministry: getMinistry(p.sector, p.agency, p.project_name, p.original_cost, p.ministry) }));
  }, [allProjects]);`;

let code2 = code.replace(target, rep);
if (code2 === code) { code2 = code.replace(target.replace(/\n/g, '\r\n'), rep); }

fs.writeFileSync('src/components/DashboardClientView.tsx', code2, 'utf8');
