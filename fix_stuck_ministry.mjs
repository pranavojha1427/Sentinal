import { MongoClient } from "mongodb";
import dotenv from "dotenv";

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
  
  const result = await db.collection("proposals").updateMany(
    { status: "pending_ministry", ministry: { $in: [null, undefined, ""] } },
    { $set: { ministry: "Department for Promotion of Industry & Internal Trade" } }
  );
  
  console.log(`Updated ${result.modifiedCount} stuck proposals to the correct ministry.`);
  
  await client.close();
  process.exit(0);
}
run();
