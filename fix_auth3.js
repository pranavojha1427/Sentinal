const fs = require('fs');
const path = 'src/lib/auth.ts';
let content = fs.readFileSync(path, 'utf8');

const newFallback = `,
  {
    _id: "6aa5983066ef873e489e4ab5",
    email: "you5@pragatipulse.gov.in",
    name: "Prabhat Singh",
    passwordHash: "$2b$12$nH6Xga9zbgBKzZ4CJv80K.bCVnOuZ3tZNYfb.3P17qITq69gkDdAm",
    role: "ministry",
    ministry: "Ministry of New and Renewable Energy",
    active: true
  }
];`;

content = content.replace('];', newFallback);
fs.writeFileSync(path, content, 'utf8');
console.log("Fixed auth.ts Prabhat Singh");
