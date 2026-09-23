import { MongoClient } from "mongodb";
import dotenv from "dotenv";

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
  
  // 1. Update the user
  await db.collection("users").updateOne(
    { name: { $regex: /Shrabasti/i } },
    { $set: { ministry: "Department for Promotion of Industry & Internal Trade" } }
  );
  
  // 2. Update any other users with the bad casing
  await db.collection("users").updateMany(
    { ministry: "Department for Promotion of industry & internal trade" },
    { $set: { ministry: "Department for Promotion of Industry & Internal Trade" } }
  );
  
  // 3. Update any proposals with bad casing
  await db.collection("proposals").updateMany(
    { ministry: "Department for Promotion of industry & internal trade" },
    { $set: { ministry: "Department for Promotion of Industry & Internal Trade" } }
  );
  
  console.log("Fixed casing in MongoDB");
  
  await client.close();
  process.exit(0);
}
run();
