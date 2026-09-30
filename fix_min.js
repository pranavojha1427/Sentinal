const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardClientView.tsx', 'utf8');

const target = `  const getMinistry = (sector: string, agency: string, project_name: string, cost: number, assignedMinistry: string | null) => {
    // All projects are pre-aligned in the database to match the official
    // Sector-Wise-Report Excel from MoSPI/Paimana. Trust the DB 100%.
    if (assignedMinistry) return assignedMinistry;
    return "Other";
  };`;

const rep = `  const getMinistry = (sector: string, agency: string, project_name: string, cost: number, assignedMinistry: string | null) => {
    if (assignedMinistry) return assignedMinistry;
    const s = (sector || "").toLowerCase();
    if (s.includes("road") || s.includes("highway")) return "Ministry of Road Transport & Highways";
    if (s.includes("rail")) return "Ministry of Railways";
    if (s.includes("power") || s.includes("energy")) return "Ministry of Power";
    if (s.includes("petroleum") || s.includes("oil") || s.includes("gas")) return "Ministry of Petroleum & Natural Gas";
    if (s.includes("coal")) return "Ministry of Coal";
    if (s.includes("water") || s.includes("river")) return "Department of Water Resources, River Development & GR";
    if (s.includes("telecom") || s.includes("communication")) return "Department of Telecommunications";
    if (s.includes("civil") || s.includes("aviation") || s.includes("airport")) return "Ministry of Civil Aviation";
    if (s.includes("health") || s.includes("hospital")) return "Ministry of Health & Family Welfare";
    if (s.includes("steel")) return "Ministry of Steel";
    if (s.includes("mine") || s.includes("mining")) return "Ministry of Mines";
    if (s.includes("urban") || s.includes("housing")) return "Ministry of Housing & Urban Affairs";
    if (s.includes("port") || s.includes("shipping")) return "Ministry of Ports, Shipping and Waterways";
    if (s.includes("chemical") || s.includes("fertilizer")) return "Ministry of Chemicals and Fertilizers";
    if (s.includes("education")) return "Department of Higher Education";
    if (s.includes("sport")) return "Department of Sports";
    if (s.includes("renewable")) return "Ministry of New & Renewable Energy";
    if (s.includes("industry")) return "Department for Promotion of Industry & Internal Trade";
    return "Other";
  };`;

let code2 = code.replace(target, rep);
if (code2 === code) { code2 = code.replace(target.replace(/\n/g, '\r\n'), rep); }

fs.writeFileSync('src/components/DashboardClientView.tsx', code2, 'utf8');
