import os

path = "src/components/AdminAccountManager.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_ministry = '"Ministry of Environment, Forest and Climate Change",'
new_ministry = '"Ministry of Environment, Forest and Climate Change",\n  "Ministry of Youth Affairs and Sports",'

content = content.replace(old_ministry, new_ministry)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Added Ministry of Youth Affairs and Sports")
