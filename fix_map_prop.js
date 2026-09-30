const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardClientView.tsx', 'utf8');

const target = `<StateRiskMap country={countryFilter} projects={allProjects}`;
const rep = `<StateRiskMap country={countryFilter} projects={projectsWithMinistry}`;

let code2 = code.replace(target, rep);

fs.writeFileSync('src/components/DashboardClientView.tsx', code2, 'utf8');
