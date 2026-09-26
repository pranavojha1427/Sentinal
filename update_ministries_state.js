const { MongoClient } = require('mongodb');

async function updateMinistries() {
    const client = new MongoClient('mongodb+srv://shreyancodes2006_db_user:NhT3AQBtQTZ4xCZa@cluster0.cymdl8r.mongodb.net/user');
    await client.connect();
    const db = client.db('pragatipulse');
    const result = await db.collection('users').updateMany(
        { role: 'ministry' },
        { $set: { state: 'West Bengal' } }
    );
    console.log(`Updated ${result.modifiedCount} ministry accounts to West Bengal.`);
    await client.close();
}

updateMinistries().catch(console.error);
