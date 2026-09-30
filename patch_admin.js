const fs = require('fs');
const file = 'src/components/AdminAccountManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const bricsStates = \
const BRICS_STATES: Record<string, string[]> = {
  "India": [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
    "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
    "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ],
  "Brazil": [
    "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", 
    "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", 
    "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", 
    "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", 
    "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
  ],
  "Russia": [
    "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", 
    "Nizhny Novgorod", "Chelyabinsk", "Krasnoyarsk", "Samara", "Ufa", "Rostov-on-Don"
  ],
  "China": [
    "Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi", 
    "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", 
    "Inner Mongolia", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Ningxia", 
    "Qinghai", "Shaanxi", "Shandong", "Shanghai", "Shanxi", "Sichuan", 
    "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang"
  ],
  "South Africa": [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", 
    "Mpumalanga", "Northern Cape", "North West", "Western Cape"
  ]
};
\;

code = code.replace(/const STATES = \[\s*[\s\S]*?\];/, bricsStates);
code = code.replace('const [form, setForm] = useState', 'const activeCountry = currentUser?.country || form.country || "India";\n  const STATES = BRICS_STATES[activeCountry] || BRICS_STATES["India"];\n  const [form, setForm] = useState');
code = code.replace('{form.role === "Country Admin" && (', '{isBricsAdmin && (');

fs.writeFileSync(file, code);
