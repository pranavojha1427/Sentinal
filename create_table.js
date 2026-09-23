const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS mongo_fallback_users (
      email TEXT PRIMARY KEY,
      name TEXT,
      "passwordHash" TEXT,
      role TEXT,
      ministry TEXT,
      agency TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Table created successfully');
  await client.end();
}

run().catch(console.error);
