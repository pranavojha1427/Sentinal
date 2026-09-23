import os

path = "src/app/actions.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """      let overall_health = "On Track";
      let recommendation = "Continue monitoring.";

      if (cost_overrun_percent > 10.0 && physical_progress < 50.0) {
          overall_health = "Critical";
          recommendation = "Trigger financial scrutiny";
      } else if (cost_overrun_score > 30.0 || schedule_risk_score > 50.0) {
          overall_health = "At Risk";
          recommendation = "Review project execution plan and address delays.";
      }"""

new_logic = """      let overall_health = "On Track";
      let recommendation = "Maintain current monitoring protocols. Project execution velocity remains well-aligned with financial deployments, reflecting strong governance. Continue regular milestone tracking and ensure risk mitigation contingency funds remain available to sustain this operational momentum.";

      if (cost_overrun_percent > 10.0 && physical_progress < 50.0) {
          overall_health = "Critical";
          recommendation = "Trigger immediate financial scrutiny and halt further disbursements. Given the cost overrun exceeding 10% coupled with a physical progress below 50%, an exhaustive forensic audit is highly recommended to identify fund leakages and restructure timelines.";
      } else if (cost_overrun_score > 30.0 || schedule_risk_score > 50.0) {
          overall_health = "At Risk";
          recommendation = "Conduct a thorough review of the project execution plan immediately. With schedule and cost risk scores climbing, it is vital to mandate contractor performance metrics, expedite pending clearances, and streamline supply chains to prevent further delays.";
      }"""

content = content.replace(old_logic, new_logic)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated AI recommendations in actions.ts")
