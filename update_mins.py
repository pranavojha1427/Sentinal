import os
import re

path = "src/components/AdminAccountManager.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

new_ministries = """const MINISTRIES = [
  "Department for Promotion of Industry & Internal Trade",
  "Department of Higher Education",
  "Department of Sports",
  "Department of Telecommunications",
  "Department of Water Resources, River Development & GR",
  "Ministry of Chemicals and Fertilizers",
  "Ministry of Civil Aviation",
  "Ministry of Coal",
  "Ministry of Health & Family Welfare",
  "Ministry of Housing & Urban Affairs",
  "Ministry of Labour and Employment",
  "Ministry of Mines",
  "Ministry of New & Renewable Energy",
  "Ministry of Petroleum & Natural Gas",
  "Ministry of Ports, Shipping and Waterways",
  "Ministry of Power",
  "Ministry of Railways",
  "Ministry of Road Transport & Highways",
  "Ministry of Steel"
];"""

content = re.sub(r'const MINISTRIES = \[.*?\];', new_ministries, content, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated MINISTRIES in AdminAccountManager")
