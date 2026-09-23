import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");
const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
await db.collection("users").createIndex({ email: 1 }, { unique: true });
await db.collection("projects").createIndex({ agency: 1, updatedAt: -1 });
await db.collection("project_overrides").createIndex({ projectId: 1 }, { unique: true });
await db.collection("proposals").createIndex({ status: 1 });
await db.collection("proposals").createIndex({ ministry: 1 });
await db.collection("proposals").createIndex({ agency: 1 });
await db.collection("bids").createIndex({ proposalId: 1 });
await db.collection("bids").createIndex({ agencyId: 1 });
await db.collection("notifications").createIndex({ userId: 1, isRead: 1 });
console.log("MongoDB project indexes ready.");
await client.close();

