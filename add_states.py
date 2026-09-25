with open('src/components/ViewComplaints.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

indian_states = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

target = """      if (!error && data) {
        setComplaints(data);
        const uniqueStates = Array.from(new Set(data.map(d => d.state).filter(Boolean)));
        setStates(["All States", ...uniqueStates]);
      }"""

replacement = """      if (!error && data) {
        setComplaints(data);
        const staticStates = """ + str(indian_states) + """;
        const dbStates = Array.from(new Set(data.map((d: any) => d.state).filter(Boolean)));
        const combined = Array.from(new Set([...staticStates, ...dbStates])).sort();
        setStates(["All States", ...combined]);
      }"""

content = content.replace(target, replacement)

with open('src/components/ViewComplaints.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
