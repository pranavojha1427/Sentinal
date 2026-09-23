import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

DB_URL = os.getenv("DATABASE_URL")

sql = """
CREATE TABLE IF NOT EXISTS project_alerts (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id),
    project_code VARCHAR(255),
    alert_type VARCHAR(255),
    trigger_reason TEXT,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Open',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_risk_evaluations (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id),
    cost_overrun_pct NUMERIC,
    schedule_risk_score NUMERIC,
    overall_health VARCHAR(50),
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

def init_db():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()
    print("Tables created successfully.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    init_db()
