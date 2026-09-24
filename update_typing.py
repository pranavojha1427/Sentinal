import sys
with open('src/components/CitizenPortal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = "                ))}\n            </div>\n            \n            {/* Input Area */}"
target2 = "                ))}\n              </div>\n              \n              {/* Input Area */}"

replacement = """                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-xl text-sm bg-white border border-slate-200 text-slate-500 rounded-bl-none flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input Area */}"""

if target in content:
    content = content.replace(target, replacement)
elif target2 in content:
    content = content.replace(target2, replacement)
else:
    import re
    content = re.sub(r'\}\)\}\n\s*<\/div>\n\s*\{\/\*\s*Input Area\s*\*\/\}', replacement, content)

with open('src/components/CitizenPortal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
