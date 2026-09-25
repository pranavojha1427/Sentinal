import re

with open('src/components/CitizenPortal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_options = """
                  <option value="" disabled>Select Ministry</option>
                  <option value="Department for Promotion of Industry & Internal Trade">Department for Promotion of Industry & Internal Trade</option>
                  <option value="Department of Higher Education">Department of Higher Education</option>
                  <option value="Department of Sports">Department of Sports</option>
                  <option value="Department of Telecommunications">Department of Telecommunications</option>
                  <option value="Department of Water Resources, River Development & GR">Department of Water Resources, River Development & GR</option>
                  <option value="Ministry of Chemicals and Fertilizers">Ministry of Chemicals and Fertilizers</option>
                  <option value="Ministry of Civil Aviation">Ministry of Civil Aviation</option>
                  <option value="Ministry of Coal">Ministry of Coal</option>
                  <option value="Ministry of Health & Family Welfare">Ministry of Health & Family Welfare</option>
                  <option value="Ministry of Housing & Urban Affairs">Ministry of Housing & Urban Affairs</option>
                  <option value="Ministry of Labour and Employment">Ministry of Labour and Employment</option>
                  <option value="Ministry of Mines">Ministry of Mines</option>
                  <option value="Ministry of New & Renewable Energy">Ministry of New & Renewable Energy</option>
                  <option value="Ministry of Petroleum & Natural Gas">Ministry of Petroleum & Natural Gas</option>
                  <option value="Ministry of Ports, Shipping and Waterways">Ministry of Ports, Shipping and Waterways</option>
                  <option value="Ministry of Power">Ministry of Power</option>
                  <option value="Ministry of Railways">Ministry of Railways</option>
                  <option value="Ministry of Road Transport & Highways">Ministry of Road Transport & Highways</option>
                  <option value="Ministry of Steel">Ministry of Steel</option>
                  <option value="Others">Others</option>
"""

pattern = r'<option value="" disabled>Select Ministry</option>.*?<option value="Others">Others</option>'
content = re.sub(pattern, new_options.strip(), content, flags=re.DOTALL)

with open('src/components/CitizenPortal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
