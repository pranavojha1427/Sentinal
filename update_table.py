with open('src/components/ViewComplaints.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<th className="p-4 font-semibold w-1/4">Infrastructure Category</th>',
    '<th className="p-4 font-semibold w-1/6">Category / Ministry</th>\n                <th className="p-4 font-semibold w-1/6">Citizen Name</th>'
)

content = content.replace(
    '<td className="p-4">\n                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">\n                        {c.infrastructure_category || \'Unknown\'}\n                      </span>\n                    </td>',
    '<td className="p-4">\n                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold inline-block mb-1">{c.infrastructure_category || \'Unknown\'}</div>\n                      <div className="text-xs text-slate-500">{c.ministry || \'Unassigned\'}</div>\n                    </td>\n                    <td className="p-4 text-slate-700 font-medium">{c.name || \'Anonymous\'}</td>'
)

with open('src/components/ViewComplaints.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
