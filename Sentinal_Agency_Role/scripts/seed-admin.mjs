import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");

const email = (process.env.ADMIN_EMAIL || "admin@pragatipulse.gov.in").toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!password) throw new Error("ADMIN_PASSWORD is required");

const client = new MongoClient(uri);
await client.connect();

const db = client.db(process.env.MONGODB_DB_NAME || "pragatipulse");
const users = db.collection("users");

await users.createIndex({ email: 1 }, { unique: true });

const passwordHash = await bcrypt.hash(password, 12);
await users.updateOne(
  { email },
  {
    $set: {
      name: process.env.ADMIN_NAME || "System Administrator",
      email,
      passwordHash,
      role: "admin",
      active: true,
      updatedAt: new Date(),
    },
    $setOnInsert: { createdAt: new Date() },
  },
  { upsert: true }
);

console.log(`Admin account ready: ${email}`);
await client.close();
