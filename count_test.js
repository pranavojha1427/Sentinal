const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || 'pragatipulse');
        
        const c1 = await db.collection('projects').countDocuments({});
        const c2 = await db.collection('project_overrides').countDocuments({});
        const c3 = await db.collection('proposals').countDocuments({});
        
        console.log('Projects:', c1);
        console.log('Overrides:', c2);
        console.log('Proposals:', c3);
        
        // Also let's print the actual data inside 'projects' to see if there are crazy costs
        const projects = await db.collection('projects').find({}).toArray();
        console.log('\nProjects data:', JSON.stringify(projects, null, 2));

    } finally {
        await client.close();
    }
}
run();
