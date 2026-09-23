import { MongoClient } from "mongodb";
import dotenv from "dotenv";

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
  
  const notifs = await db.collection("notifications").find({ title: "Project Completed" }).toArray();
  console.log("Project Completed Notifications:", JSON.stringify(notifs, null, 2));
  
  await client.close();
  process.exit(0);
}
run();
