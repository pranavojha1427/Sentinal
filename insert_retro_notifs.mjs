import { MongoClient } from "mongodb";
import dotenv from "dotenv";

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
  
  const completedProj = await db.collection("projects").findOne({ is_completed: true });
  if (completedProj) {
    const notifs = [
      { targetRole: "admin", title: "Project Completed", message: `Agency ${completedProj.agency} has successfully completed the project: ${completedProj.project_name || completedProj.project_code}!`, isRead: false, createdAt: new Date() }
    ];
    if (completedProj.ministry) {
      notifs.push({ targetMinistry: completedProj.ministry, title: "Project Completed", message: `Agency ${completedProj.agency} has successfully completed the project: ${completedProj.project_name || completedProj.project_code}!`, isRead: false, createdAt: new Date() });
    }
    
    await db.collection("notifications").insertMany(notifs);
    console.log("Inserted retroactive notifications.");
  } else {
    console.log("No completed projects found");
  }
  
  await client.close();
  process.exit(0);
}
run();
