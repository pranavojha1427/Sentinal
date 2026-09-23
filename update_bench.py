import os

path = "src/components/BenchmarksDashboard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """  const sectorBenchmark = useMemo(() => {
    if (!selectedProject) return null;
    return benchmarks.find(b => b.sector === selectedProject.sector);
  }, [benchmarks, selectedProject]);

  if (!selectedProject || !sectorBenchmark) {
    return <div className="p-8 text-center text-slate-500">Loading benchmark data...</div>;
  }"""

new_logic = """  const sectorBenchmark = useMemo(() => {
    if (!selectedProject) return null;
    const found = benchmarks.find(b => b.sector === selectedProject.sector);
    return found || {
      sector: selectedProject.sector,
      avg_cost_overrun_pct: 0,
      avg_expenditure_progress_pct: 0,
      avg_physical_progress: 0
    };
  }, [benchmarks, selectedProject]);

  if (!selectedProject) {
    return <div className="p-8 text-center text-slate-500">No project selected. Please ensure you have active projects.</div>;
  }"""

content = content.replace(old_logic, new_logic)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated BenchmarksDashboard fallback logic")
