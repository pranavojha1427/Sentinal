with open('src/components/CitizenPortal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '{/* Input Area */}' in line:
        idx = i - 1
        break

lines.insert(idx, """                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-xl text-sm bg-white border border-slate-200 text-slate-500 rounded-bl-none flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                    </div>
                  </div>
                )}\n""")

with open('src/components/CitizenPortal.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
