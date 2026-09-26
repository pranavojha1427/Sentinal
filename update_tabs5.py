with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will define the extra tabs and append them to all authenticated users
extra_tabs = """
               // Add analytics tabs for everyone except unauthenticated
               if (currentUser) {
                   tabs.push(
                       { id: 'agency', label: 'Agency Leaderboard' },
                       { id: 'benchmarks', label: 'Benchmarks' },
                       { id: 'risk', label: 'Risk Prediction' },
                       { id: 'alerts', label: 'Alerts & Actions' }
                   );
               }
"""

content = content.replace(
    'return tabs.map(tab => (',
    extra_tabs + '\n               return tabs.map(tab => ('
)

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
