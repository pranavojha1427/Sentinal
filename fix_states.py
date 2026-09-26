import re

with open('src/components/AdminInspectors.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

states_list = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]
states_list.sort()

options_html = '\n'.join([f'                <option value="{s}">{s}</option>' for s in states_list])

old_select = r'<select value=\{state\} onChange=\{e=>setState\(e\.target\.value\)\} className="w-full mt-1 p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none bg-white">[\s\S]*?<\/select>'

new_select = f'''<select value={{state}} onChange={{e=>setState(e.target.value)}} className="w-full mt-1 p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none bg-white">
{options_html}
              </select>'''

content = re.sub(old_select, new_select, content)

with open('src/components/AdminInspectors.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
