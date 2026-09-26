const { MongoClient } = require('mongodb');

async function activateAllUsers() {
    const client = new MongoClient('mongodb+srv://shreyancodes2006_db_user:NhT3AQBtQTZ4xCZa@cluster0.cymdl8r.mongodb.net/user');
    await client.connect();
    const db = client.db('pragatipulse');
    
    const result = await db.collection('users').updateMany(
        { active: { $ne: true } },
        { $set: { active: true } }
    );
    
    console.log(`Activated ${result.modifiedCount} users.`);
    await client.close();
}

activateAllUsers().catch(console.error);
