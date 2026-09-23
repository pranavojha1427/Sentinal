import { MongoClient } from "mongodb";
import dotenv from "dotenv";

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
  
  const user = await db.collection("users").findOne({ name: { $regex: /Shrabasti/i } });
  console.log("User:", user);
  
  const pending = await db.collection("proposals").find({ status: "pending_ministry" }).toArray();
  console.log("Pending proposals:", JSON.stringify(pending, null, 2));
  
  await client.close();
  process.exit(0);
}
run();
