const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardClientView.tsx', 'utf8');

const targetStateGen = `  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    projectsWithMinistry.forEach(p => {
      if (p.state) {
        p.state.split(',').forEach((s: string) => states.add(s.trim()));
      }
    });
    return Array.from(states).sort();
  }, [projectsWithMinistry]);`;

const repStateGen = `  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    projectsWithMinistry.forEach(p => {
      let pCountry = 'India';
      if (p.state) {
          for (const [c, bricsStates] of Object.entries(BRICS_STATES)) {
              if (bricsStates.some((bs: string) => p.state.includes(bs) || bs.includes(p.state))) {
                  pCountry = c;
                  break;
              }
          }
      }
      if (countryFilter === 'All' || pCountry === countryFilter) {
          if (p.state) {
            p.state.split(',').forEach((s: string) => states.add(s.trim()));
          }
      }
    });
    return Array.from(states).sort();
  }, [projectsWithMinistry, countryFilter]);`;

const targetFilter = `    // Multi-tenant / BRICS filtering logic
    result = result.filter(p => {
        let pCountry = 'India';
        if (p.state) {
            for (const [c, states] of Object.entries(BRICS_STATES)) {
                if (states.includes(p.state)) {
                    pCountry = c;
                    break;
                }
            }
        }
        if (countryFilter === 'All') return true;
          return pCountry === countryFilter;
    });`;

const repFilter = `    // Multi-tenant / BRICS filtering logic
    result = result.filter(p => {
        let pCountry = 'India';
        if (p.state) {
            for (const [c, bricsStates] of Object.entries(BRICS_STATES)) {
                if (bricsStates.some((bs: string) => p.state.includes(bs) || bs.includes(p.state))) {
                    pCountry = c;
                    break;
                }
            }
        }
        if (countryFilter === 'All') return true;
        return pCountry === countryFilter;
    });`;

let code2 = code.replace(targetStateGen, repStateGen);
if (code2 === code) { code2 = code.replace(targetStateGen.replace(/\n/g, '\r\n'), repStateGen); }

let code3 = code2.replace(targetFilter, repFilter);
if (code3 === code2) { code3 = code2.replace(targetFilter.replace(/\n/g, '\r\n'), repFilter); }

fs.writeFileSync('src/components/DashboardClientView.tsx', code3, 'utf8');
