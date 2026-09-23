const fs = require('fs');
const path = 'src/components/ProposalForm.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetState = `const [form, setForm] = useState({ project_code: "", project_name: "", sector: "Roads & Highways", ministry: "Department for Promotion of Industry & Internal Trade", state: "", expected_expenditure: "", start_date: "", end_date: "", details: "" });`;
const replacementState = `const [form, setForm] = useState({ project_code: "", project_name: "", sector: "Roads & Highways", ministry: currentUser?.role === "ministry" && currentUser?.ministry ? currentUser.ministry : "Department for Promotion of Industry & Internal Trade", state: "", expected_expenditure: "", start_date: "", end_date: "", details: "" });`;

content = content.replace(targetState, replacementState);

const targetSelect = `<select required className="border p-3 rounded-lg bg-white" value={form.ministry} onChange={e => setForm({...form, ministry: e.target.value})}>`;
const replacementSelect = `<select required disabled={currentUser?.role === "ministry"} className={\`border p-3 rounded-lg \${currentUser?.role === "ministry" ? "bg-slate-100 cursor-not-allowed text-slate-500" : "bg-white"}\`} value={form.ministry} onChange={e => setForm({...form, ministry: e.target.value})}>`;

content = content.replace(targetSelect, replacementSelect);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated ProposalForm.tsx");
