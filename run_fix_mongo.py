from pymongo import MongoClient
import os
import json
import time

uri = os.environ.get("MONGODB_URI", "")
if not uri:
    # try reading from .env
    with open(".env", "r") as f:
        for line in f:
            if line.startswith("MONGODB_URI="):
                uri = line.split("=", 1)[1].strip()

client = MongoClient(uri)
db = client["pragatipulse"]

proposals = list(db.proposals.find({"status": "approved"}))
for p in proposals:
    existing = db.projects.find_one({"project_name": p.get("project_name")})
    if not existing:
        agency = p.get("agency")
        cost = p.get("expected_expenditure", 0)
        try:
            cost = float(cost)
        except:
            cost = 0
            
        for f in p.get("feedback", []):
            text = f.get("text", "")
            if text.startswith("Bid awarded to "):
                # Bid awarded to Samrat Agency for ?234 Cr.
                try:
                    agency_part = text.split("Bid awarded to ")[1]
                    agency = agency_part.split(" for ?")[0]
                    cost_part = agency_part.split(" for ?")[1]
                    cost = float(cost_part.split(" Cr.")[0])
                except Exception as e:
                    pass
        
        project = {
            "project_code": p.get("project_code", f"BID-{int(time.time()*1000)}"),
            "project_name": p.get("project_name"),
            "sector": p.get("sector", "Others"),
            "ministry": p.get("ministry"),
            "agency": agency,
            "state": p.get("state"),
            "original_cost": cost,
            "revised_cost": cost,
            "cumulative_expenditure": 0,
            "physical_progress": 0,
            "source": "agency",
            "createdBy": "admin@pragatipulse.gov.in"
        }
        db.projects.insert_one(project)
        print(f"Created project: {project['project_name']} for {project['agency']}")

print("Done")
