import { MongoClient } from "mongodb";
import dotenv from "dotenv";

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
  
  const p = await db.collection("projects").findOne({ project_name: "Highway123" });
  console.log("Original Cost:", p?.original_cost, "Type:", typeof p?.original_cost);
  
  await client.close();
  process.exit(0);
}
run();
