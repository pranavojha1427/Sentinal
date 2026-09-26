with open('src/app/login/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''        <p className="mt-6 text-sm text-slate-600">
          New user? <Link href="/signup" className="font-bold underline">Create an account</Link>
        </p>'''

replacement = '''        <p className="mt-6 text-sm text-slate-600">
          New user? <Link href="/signup" className="font-bold underline">Create an account</Link>
        </p>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-mono uppercase mb-3">Field Operations</p>
          <Link href="/inspector" className="w-full inline-block text-center border-2 border-indigo-600 text-indigo-700 bg-indigo-50 font-bold p-3 hover:bg-indigo-100 transition">
            Inspector Field Portal
          </Link>
        </div>'''

content = content.replace(target, replacement)

with open('src/app/login/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
