const { MongoClient } = require('mongodb');
require('dotenv').config();

async function getEmails() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('pragatipulse');
    const users = await db.collection('users').find({}, { projection: { email: 1, name: 1, role: 1 } }).toArray();
    console.log('--- Registered Users ---');
    users.forEach(u => console.log(`- ${u.email} (${u.name} - ${u.role})`));
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await client.close();
  }
}
getEmails();
