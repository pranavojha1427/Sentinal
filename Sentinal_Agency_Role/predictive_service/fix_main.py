import re

with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("# --- LLM Assistant ---")
if idx != -1:
    content = content[:idx]

new_code = """# --- LLM Assistant ---

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel

@tool
def get_high_risk_projects(state: str = None, sector: str = None):
    '''Returns projects flagged as 'Critical'. Optionally filters by state and sector.'''
    query = supabase.table("projects").select("project_code, project_name, state, sector, original_cost, revised_cost, cumulative_expenditure, physical_progress")
    if state:
        query = query.ilike("state", f"%{state}%")
    if sector:
        query = query.ilike("sector", f"%{sector}%")
    
    response = query.execute()
    critical_projects = []
    for p in response.data:
        cost_overrun = 0
        if p.get("original_cost") and p.get("revised_cost"):
            cost_overrun = ((p["revised_cost"] - p["original_cost"]) / p["original_cost"]) * 100
        phys_prog = p.get("physical_progress") or 0
        
        if cost_overrun > 15 or phys_prog < 5:
            critical_projects.append({
                "project_code": p.get("project_code"),
                "project_name": p.get("project_name"),
                "state": p.get("state"),
                "sector": p.get("sector"),
                "cost_overrun_pct": round(cost_overrun, 2),
                "physical_progress": phys_prog
            })
            
    return critical_projects[:15]

@tool
def get_project_details(project_code: str):
    '''Returns financials and schedule delays for a specific project.'''
    response = supabase.table("projects").select("*").eq("project_code", project_code).execute()
    if not response.data:
        return {"error": "Project not found"}
    p = response.data[0]
    
    delay_months = "Unknown"
    if p.get("original_doc") and p.get("revised_doc"):
        try:
            from datetime import datetime
            orig = datetime.fromisoformat(p["original_doc"].replace('Z', '+00:00'))
            rev = datetime.fromisoformat(p["revised_doc"].replace('Z', '+00:00'))
            delay_months = (rev.year - orig.year) * 12 + rev.month - orig.month
        except Exception:
            pass
            
    return {
        "project_name": p.get("project_name"),
        "original_cost": p.get("original_cost"),
        "revised_cost": p.get("revised_cost"),
        "cumulative_expenditure": p.get("cumulative_expenditure"),
        "physical_progress": p.get("physical_progress"),
        "delay_months": delay_months
    }

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0)
        tools = [get_high_risk_projects, get_project_details]
        
        system_prompt = \"\"\"You are a Lead Agentic AI Architect and Project Intelligence Assistant for MoSPI officials.
You must synthesize the database JSON returns into concise, professional executive summaries.
NEVER hallucinate data; if you do not know the answer based on the database, you must state that you do not know.
Format your responses using Markdown, including structured tables and bold text where appropriate to make it executive-friendly.\"\"\"
        
        agent = create_react_agent(llm, tools, state_modifier=system_prompt)
        
        result = agent.invoke({"messages": [("user", req.message)]})
        final_message = result["messages"][-1].content
        return {"response": final_message}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"response": f"**Backend Error:** {str(e)}"}
"""

with open("main.py", "w", encoding="utf-8") as f:
    f.write(content + new_code)
