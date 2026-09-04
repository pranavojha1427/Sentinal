Sentinel (Orchestrator): Controls data migration milestones, schema initialization, and pipeline verification.

Explorer (Data Architect): Maps PDF tables (Overview, Sectoral, State-wise, and Table 6 All Ongoing Projects) into normalized relational entities.

Worker (Implementation Agent): Executes table parsing scripts, spins up the database migration, and exposes the baseline CRUD endpoints.

Auditor (Data Verifier): Verifies data parity (e.g., confirming the imported database reflects exactly 1,981 projects, ₹37,12,662 crore original cost, and 801 projects in the 81–100% physical progress bracket).