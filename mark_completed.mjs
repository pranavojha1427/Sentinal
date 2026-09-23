import { MongoClient } from "mongodb";
import dotenv from "dotenv";

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
  
  // Update Mongo Projects
  const res1 = await db.collection("projects").updateMany(
    { physical_progress: 100 },
    { $set: { is_completed: true } }
  );
  
  // Update Overrides
  const res2 = await db.collection("project_overrides").updateMany(
    { physical_progress: 100 },
    { $set: { is_completed: true } }
  );
  
  console.log(`Marked ${res1.modifiedCount} mongo projects and ${res2.modifiedCount} overrides as completed.`);
  
  await client.close();
  process.exit(0);
}
run();
