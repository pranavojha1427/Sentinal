import { MongoClient } from "mongodb";
import dotenv from "dotenv";

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
  
  const rejected = await db.collection("proposals").find({ status: "rejected_by_admin" }).toArray();
  console.log("Rejected proposals:", JSON.stringify(rejected, null, 2));
  
  await client.close();
  process.exit(0);
}
run();
