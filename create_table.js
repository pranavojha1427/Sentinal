require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  // We can't run DDL easily via REST, so let's just make an RPC call if we have one, or just use the postgres URI via pg
  const { Client } = require('pg');
  const client = new Client({
    connectionString: "postgresql://postgres:SentinalForce%401427@db.ygbtrapskuguoagegftn.supabase.co:5432/postgres"
  });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS project_feedbacks (
        id SERIAL PRIMARY KEY,
        project_id TEXT NOT NULL,
        mobile_no TEXT NOT NULL,
        feedback_text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, mobile_no)
    );
  `);
  console.log("Table created.");
  await client.end();
}

main().catch(console.error);
