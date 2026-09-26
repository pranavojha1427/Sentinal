with open('src/components/AdminInspectors.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '<select value={state} onChange={e=>setState(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none bg-white">'
replacement = '<select value={state} onChange={e=>setState(e.target.value)} disabled={currentUser?.role === "state_admin"} className="w-full mt-1 p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-500">'

content = content.replace(target, replacement)
with open('src/components/AdminInspectors.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
