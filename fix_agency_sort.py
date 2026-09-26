with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '''    results.sort((a, b) => {
      if (a.delay_frequency_pct !== b.delay_frequency_pct) return b.delay_frequency_pct - a.delay_frequency_pct;
      if (a.avg_cost_overrun_pct !== b.avg_cost_overrun_pct) return b.avg_cost_overrun_pct - a.avg_cost_overrun_pct;
      return b.total_projects - a.total_projects;
    });''',
    '''    results.sort((a, b) => {
      if (a.delay_frequency_pct !== b.delay_frequency_pct) return a.delay_frequency_pct - b.delay_frequency_pct;
      if (a.avg_cost_overrun_pct !== b.avg_cost_overrun_pct) return a.avg_cost_overrun_pct - b.avg_cost_overrun_pct;
      return b.total_projects - a.total_projects;
    });'''
)

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
