import { MongoClient } from "mongodb";
import dotenv from "dotenv";

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
  
  const cursor = db.collection("projects").find();
  let count = 0;
  for await (const doc of cursor) {
    const updates = {};
    if (Number.isNaN(doc.original_cost)) updates.original_cost = 0;
    if (Number.isNaN(doc.revised_cost)) updates.revised_cost = 0;
    if (Number.isNaN(doc.cumulative_expenditure)) updates.cumulative_expenditure = 0;
    if (Number.isNaN(doc.physical_progress)) updates.physical_progress = 0;
    
    if (Object.keys(updates).length > 0) {
      await db.collection("projects").updateOne({ _id: doc._id }, { $set: updates });
      count++;
    }
  }
  console.log(`Fixed ${count} projects with NaN values.`);
  
  await client.close();
  process.exit(0);
}
run();
