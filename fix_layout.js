const fs = require('fs');
const path = 'src/app/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'import ChatAssistant from "@/components/ChatAssistant";',
  'import ChatAssistant from "@/components/ChatAssistant";\nimport { getSession } from "@/lib/auth";'
);

content = content.replace(
  'export default function RootLayout({ children }: LayoutProps<"/">) {',
  'export default async function RootLayout({ children }: any) {\n  const session = await getSession();'
);

content = content.replace(
  '<ChatAssistant />',
  '{session && <ChatAssistant />}'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated layout.tsx to conditionally render ChatAssistant");
