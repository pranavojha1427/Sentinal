# PragatiPulse Predictive Microservice

A FastAPI microservice providing a predictive risk engine for the MoSPI PragatiPulse platform.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## API Reference

### `POST /predict-risk`

Evaluates project financial and physical progress data to compute risk scores.

**Request Body (JSON):**
```json
{
  "original_cost": 1000.0,
  "revised_cost": 1200.0,
  "expenditure": 400.0,
  "physical_progress": 30.0
}
```

*Note: All monetary values are in INR Crores.*

**Response:**
```json
{
  "cost_overrun_score": 40.0,
  "schedule_risk_score": 73.33,
  "overall_health": "Critical",
  "recommendation": "Trigger financial scrutiny",
  "cost_escalation_crores": 200.0,
  "cost_overrun_percentage": 20.0,
  "implementation_discrepancy_percentage": -3.33
}
```

## Logic Highlights
- Computes **Cost Escalation**, **Cost Overrun %**, and **Implementation Discrepancy**.
- Strict rule-based engine: If Revised Cost > Original Cost by 10% and Physical Progress < 50%, the project is marked **Critical** and a financial scrutiny trigger is recommended.
