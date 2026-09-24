import psycopg2
import os

db_url = "postgresql://postgres:SentinalForce%401427@db.ygbtrapskuguoagegftn.supabase.co:5432/postgres"

conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS project_feedbacks (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    mobile_no TEXT NOT NULL,
    feedback_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, mobile_no)
);
""")

conn.commit()
print("Created project_feedbacks table successfully.")
cur.close()
conn.close()
