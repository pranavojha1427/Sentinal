import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI environment variable");

const options = { serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000 };

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export const DB_NAME = process.env.MONGODB_DB_NAME || "pragatipulse";
export const USERS_COLLECTION = "users";
export const PROJECTS_COLLECTION = "projects";
export const PROJECT_OVERRIDES_COLLECTION = "project_overrides";

export const PROPOSALS_COLLECTION = "proposals";
export const BIDS_COLLECTION = "bids";
export const NOTIFICATIONS_COLLECTION = "notifications";
