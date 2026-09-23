import { MongoClient } from "mongodb";
import dotenv from "dotenv";

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
  
  const proposals = await db.collection("proposals").find({ status: "approved" }).toArray();
  for (const p of proposals) {
    const existing = await db.collection("projects").findOne({ project_name: p.project_name });
    if (!existing) {
      let agency = p.agency;
      let cost = Number(p.expected_expenditure) || 0;
      
      if (p.feedback && Array.isArray(p.feedback)) {
        for (const f of p.feedback) {
          if (f.text.startsWith("Bid awarded to ")) {
             const match = f.text.match(/Bid awarded to (.*?) for ?(.*?) Cr\./);
             if (match) {
               agency = match[1];
               cost = Number(match[2]);
             }
          }
        }
      }
      
      await db.collection("projects").insertOne({
        project_code: p.project_code || `BID-${Date.now()}`,
        project_name: p.project_name,
        sector: p.sector || "Others",
        ministry: p.ministry,
        agency: agency,
        state: p.state,
        original_cost: cost,
        revised_cost: cost,
        cumulative_expenditure: 0,
        physical_progress: 0,
        source: "agency",
        createdBy: "admin@pragatipulse.gov.in"
      });
      console.log(`Converted approved proposal to project: ${p.project_name}`);
    }
  }
  await client.close();
  process.exit(0);
}
run();
