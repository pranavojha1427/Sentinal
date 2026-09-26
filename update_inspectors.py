with open('src/components/AdminInspectors.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = "export default function AdminInspectors() {"
replacement1 = "export default function AdminInspectors({ currentUser }: { currentUser?: any }) {"
content = content.replace(target1, replacement1)

target2 = 'const [state, setState] = useState("West Bengal");'
replacement2 = 'const [state, setState] = useState(currentUser?.state || "West Bengal");'
content = content.replace(target2, replacement2)

target3 = """  const fetchInspectors = async () => {
    const { data } = await supabase.from('inspectors').select('*').order('created_at', { ascending: false });
    if (data) setInspectors(data);
    setLoading(false);
  };"""

replacement3 = """  const fetchInspectors = async () => {
    let query = supabase.from('inspectors').select('*').order('created_at', { ascending: false });
    if (currentUser?.role === 'state_admin' && currentUser?.state) {
        query = query.eq('state', currentUser.state);
    }
    const { data } = await query;
    if (data) setInspectors(data);
    setLoading(false);
  };"""

content = content.replace(target3, replacement3)

with open('src/components/AdminInspectors.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
