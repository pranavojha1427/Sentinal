const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || 'pragatipulse');
        
        await db.collection('projects').deleteMany({});
        await db.collection('project_overrides').deleteMany({});
        await db.collection('proposals').deleteMany({});
        
        console.log('Cleared test projects, overrides, and proposals from MongoDB.');
    } finally {
        await client.close();
    }
}
run();
