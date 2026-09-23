import os
import hashlib
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from supabase import create_client, Client
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv() # Load variables from .env

router = APIRouter(prefix="/api/v1/citizen", tags=["Citizen Engagement"])

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

class CitizenComplaintRequest(BaseModel):
    phone_number: str
    device_id: str
    lat: float
    lon: float
    raw_text: str
    language: str = "en"

def process_complaint_and_cluster(hashed_phone: str, req: CitizenComplaintRequest):
    if not groq_client:
        print("Error: Groq API not configured.")
        return

    # 1. Analyze Complaint with Groq
    prompt = f"""
    Analyze the following citizen complaint regarding local infrastructure.
    
    Original Language: {req.language}
    Complaint Text: "{req.raw_text}"
    
    Extract and deduce the following information. Return ONLY a valid JSON object matching this exact schema:
    {{
        "translated_text": "The complaint translated to English. If it's already English, just copy it.",
        "infrastructure_category": "A short category like 'Roads', 'Water', 'Healthcare', 'Electricity'.",
        "ministry": "The likely relevant Indian Government Ministry (e.g., 'Ministry of Road Transport and Highways').",
        "sentiment_score": 0.0,
        "urgency_level": "One of: 'Low', 'Medium', 'High', 'Critical'.",
        "proposed_solution": "A detailed, practical idea or engineering solution to tackle this specific complaint."
    }}
    """
    
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        response_text = completion.choices[0].message.content.strip()
        if response_text.startswith("```json"):
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        analysis = json.loads(response_text)
    except Exception as e:
        print(f"Groq AI processing failed: {e}")
        return

    # 2. Insert into Supabase (citizen_requests)
    try:
        # Create PostGIS point: POINT(lon lat)
        point_wkt = f"POINT({req.lon} {req.lat})"
        
        insert_data = {
            "hashed_phone": hashed_phone,
            "device_id": req.device_id,
            "location": point_wkt,
            "raw_text": req.raw_text,
            "translated_text": analysis.get("translated_text", req.raw_text),
            "language": req.language,
            "infrastructure_category": analysis.get("infrastructure_category", "Unknown"),
            "ministry": analysis.get("ministry", "Unknown"),
            "sentiment_score": analysis.get("sentiment_score", 0.0),
            "urgency_level": analysis.get("urgency_level", "Medium"),
            "proposed_solution": analysis.get("proposed_solution", ""),
            "status": "Pending",
            "channel": "Web/App"
        }
        
        # We use raw sql via rpc or just insert via postgrest if PostGIS supports WKT insertion via REST.
        # Supabase PostgREST automatically casts WKT strings to Geometry.
        res = supabase.table("citizen_requests").insert(insert_data).execute()
        request_record = res.data[0] if res.data else None
    except Exception as e:
        print(f"DB Insert failed: {e}")
        return

    # 3. Check for Hotspot Escalation (Spatial Clustering)
    if request_record:
        check_and_create_hotspot(
            req.lat, 
            req.lon, 
            analysis.get("infrastructure_category", "Unknown")
        )

def check_and_create_hotspot(lat: float, lon: float, category: str):
    """
    Checks if there are enough similar requests in a 5km radius to escalate to a hotspot.
    """
    ESCALATION_THRESHOLD = 5
    RADIUS_METERS = 5000

    # We use an RPC to do the spatial query safely.
    # Alternatively, we can just call it directly if we create an RPC function.
    try:
        # Calling a custom RPC function we will create to find nearby requests
        res = supabase.rpc(
            "check_escalation_hotspot", 
            {"p_lon": lon, "p_lat": lat, "p_category": category, "p_radius": RADIUS_METERS}
        ).execute()
        
        nearby_count = res.data
        if nearby_count and nearby_count >= ESCALATION_THRESHOLD:
            # Trigger hotspot creation / ministry escalation
            # For this phase, we call another RPC that generates the polygon and escalates.
            supabase.rpc(
                "escalate_to_hotspot",
                {"p_lon": lon, "p_lat": lat, "p_category": category, "p_radius": RADIUS_METERS}
            ).execute()
            print(f"Escalation triggered for {category} at {lat}, {lon}")
    except Exception as e:
        print(f"Hotspot check failed: {e}")


@router.post("/ingest")
async def ingest_complaint(req: CitizenComplaintRequest, background_tasks: BackgroundTasks):
    """
    Ingests a citizen complaint, checks for duplicates, and triggers AI analysis.
    """
    # 1. Anonymize the phone number
    hashed_phone = hashlib.sha256(req.phone_number.encode()).hexdigest()
    
    # 2. Rate Limiting / Duplicate Check (1 complaint per category per phone)
    # Let's check if this user has already complained about this (we'll roughly check recent entries)
    # Since we extract the exact category in the AI step, for the pre-AI check, we just limit 1 complaint per day per phone
    
    # Note: A strict exact-problem check requires AI first, but for basic rate limiting:
    try:
        recent = supabase.table("citizen_requests") \
            .select("id") \
            .eq("hashed_phone", hashed_phone) \
            .order("created_at", desc=True) \
            .limit(1).execute()
        
        # In a real app, we'd check if created_at > (NOW() - 1 day)
        # We'll rely on the background task for the deep category uniqueness logic if needed.
    except Exception as e:
        pass
    
    # 3. Offload the heavy Gemini API & PostGIS work to a background task
    background_tasks.add_task(process_complaint_and_cluster, hashed_phone, req)
    
    return {"status": "success", "message": "Complaint received and queued for AI analysis."}
