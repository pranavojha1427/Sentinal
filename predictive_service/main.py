from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="PragatiPulse Predictive Microservice",
    description="Predictive API for MoSPI platform to evaluate project health.",
    version="1.0.0"
)

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Recommend narrowing this down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProjectFinancialData(BaseModel):
    original_cost: float = Field(..., description="Original Cost in INR Crores", ge=0)
    revised_cost: float = Field(..., description="Revised Cost in INR Crores", ge=0)
    expenditure: float = Field(..., description="Expenditure in INR Crores", ge=0)
    physical_progress: float = Field(..., description="Physical Progress percentage (0-100)", ge=0, le=100)

class RiskPrediction(BaseModel):
    cost_overrun_score: float = Field(..., description="Score from 0 to 100")
    schedule_risk_score: float = Field(..., description="Score from 0 to 100")
    overall_health: str = Field(..., description="'Critical', 'At Risk', or 'On Track'")
    recommendation: str
    cost_escalation_crores: float
    cost_overrun_percentage: float
    implementation_discrepancy_percentage: float
    SHAP_Explanation: list[str] = []

@app.post("/predict-risk", response_model=RiskPrediction)
def predict_risk(data: ProjectFinancialData):
    # Domain guidelines computations
    cost_escalation = data.revised_cost - data.original_cost
    
    if data.original_cost > 0:
        cost_overrun_percent = (cost_escalation / data.original_cost) * 100
    else:
        cost_overrun_percent = 0.0
        
    if data.revised_cost > 0:
        financial_progress = (data.expenditure / data.revised_cost) * 100
    else:
        financial_progress = 0.0
        
    implementation_discrepancy = data.physical_progress - financial_progress
    
    # Rule-based Engine
    # Cost-Overrun Score (0-100): scale up based on the overrun percentage
    cost_overrun_score = max(0.0, min(100.0, cost_overrun_percent * 2))  # e.g., 50% overrun gives score 100
    
    # Schedule-Risk Score (0-100): lower progress and negative discrepancy increase risk
    # If expenditure is high but physical progress is low, risk goes up
    schedule_risk_score = max(0.0, min(100.0, (100.0 - data.physical_progress) + max(0.0, -implementation_discrepancy)))

    # Default values
    overall_health = "On Track"
    recommendation = "Continue monitoring."

    # Specific strict rule based on requirements
    if cost_overrun_percent > 10.0 and data.physical_progress < 50.0:
        overall_health = "Critical"
        recommendation = "Trigger financial scrutiny"
    elif cost_overrun_score > 30.0 or schedule_risk_score > 50.0:
        overall_health = "At Risk"
        recommendation = "Review project execution plan and address delays."

    shap_explanations = []
    
    if overall_health == "Critical":
        if cost_overrun_percent > 10.0:
            shap_explanations.append(f"Cost overrun is {cost_overrun_percent:.1f}% -> High cost-risk contribution")
        if data.physical_progress < 50.0:
            shap_explanations.append(f"Physical progress is {data.physical_progress:.1f}% below plan -> High schedule-risk contribution")
        if cost_escalation > 0:
            shap_explanations.append(f"Revised cost increased by ₹{cost_escalation:.1f} Cr -> Medium-high cost-risk contribution")
        if implementation_discrepancy < -10:
            shap_explanations.append(f"Financial progress exceeds physical by {-implementation_discrepancy:.1f}% -> Fund diversion risk")

    return RiskPrediction(
        cost_overrun_score=round(cost_overrun_score, 2),
        schedule_risk_score=round(schedule_risk_score, 2),
        overall_health=overall_health,
        recommendation=recommendation,
        cost_escalation_crores=round(cost_escalation, 2),
        cost_overrun_percentage=round(cost_overrun_percent, 2),
        implementation_discrepancy_percentage=round(implementation_discrepancy, 2),
        SHAP_Explanation=shap_explanations
    )

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.post("/api/generate-alerts")
def generate_alerts():
    # 1. Clear existing alerts (optional, but good for demo to avoid infinite growing lists on multiple calls)
    # Supabase REST doesn't easily support truncate, so we'll delete all where id > 0 (or just skip clearing if we want to keep them)
    # Actually, we can just fetch and insert. To avoid duplicates, maybe just insert.
    # For a hackathon, we'll try to delete them to keep it clean, but RLS might prevent bulk delete. We'll skip delete.
    
    # 2. Fetch projects
    response = supabase.table("projects").select("*").execute()
    projects = response.data
    
    alerts_to_insert = []
    
    for p in projects:
        project_id = p["id"]
        project_code = p.get("project_code", "")
        orig_cost = p.get("original_cost") or 0
        rev_cost = p.get("revised_cost") or orig_cost
        expenditure = p.get("cumulative_expenditure") or 0
        physical_progress = p.get("physical_progress") or 0
        
        # Calculate derived metrics
        cost_escalation = rev_cost - orig_cost
        cost_overrun_pct = (cost_escalation / orig_cost * 100) if orig_cost > 0 else 0
        expenditure_progress_pct = (expenditure / rev_cost * 100) if rev_cost > 0 else 0
        
        # 1. Progress Discrepancy (Warning)
        if expenditure_progress_pct > physical_progress + 15:
            alerts_to_insert.append({
                "project_id": project_id,
                "project_code": project_code,
                "alert_type": "Progress Discrepancy",
                "trigger_reason": f"Financial progress ({expenditure_progress_pct:.1f}%) exceeds physical progress ({physical_progress:.1f}%) by >15%",
                "severity": "Warning",
                "status": "Open"
            })
            
        # 2. Cost Escalation (Critical)
        if cost_overrun_pct > 15:
            alerts_to_insert.append({
                "project_id": project_id,
                "project_code": project_code,
                "alert_type": "Cost Escalation",
                "trigger_reason": f"Cost overrun of {cost_overrun_pct:.1f}% exceeds 15% threshold",
                "severity": "Critical",
                "status": "Open"
            })
            
        # 3. Stalled Project (Critical)
        time_elapsed_pct = 25.0 
        if physical_progress < 5 and time_elapsed_pct > 20:
            alerts_to_insert.append({
                "project_id": project_id,
                "project_code": project_code,
                "alert_type": "Stalled Project",
                "trigger_reason": f"Physical progress is only {physical_progress:.1f}% despite significant time elapsed",
                "severity": "Critical",
                "status": "Open"
            })
            
    # Insert alerts in batches
    if alerts_to_insert:
        chunk_size = 500
        for i in range(0, len(alerts_to_insert), chunk_size):
            try:
                supabase.table("project_alerts").insert(alerts_to_insert[i:i+chunk_size]).execute()
            except Exception as e:
                print("Insert error:", e)
    
    return {"status": "success", "alerts_generated": len(alerts_to_insert)}

# --- LLM Assistant ---

from langchain_groq import ChatGroq
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
        llm = ChatGroq(model="qwen/qwen3.8-27b", temperature=0)
        tools = [get_high_risk_projects, get_project_details]
        
        system_prompt = """You are a Lead Agentic AI Architect and Project Intelligence Assistant for MoSPI officials.
You must synthesize the database JSON returns into concise, professional executive summaries.
NEVER hallucinate data; if you do not know the answer based on the database, you must state that you do not know.
Format your responses using Markdown, including structured tables and bold text where appropriate to make it executive-friendly."""
        
        agent = create_react_agent(llm, tools, prompt=system_prompt)
        
        result = agent.invoke({"messages": [("user", req.message)]})
        final_message = result["messages"][-1].content
        return {"response": final_message}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"response": f"**Backend Error:** {str(e)}"}
