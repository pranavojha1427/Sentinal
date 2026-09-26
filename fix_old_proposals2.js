const { MongoClient } = require('mongodb');
async function fixProposals() {
    const client = new MongoClient('mongodb+srv://shreyancodes2006_db_user:NhT3AQBtQTZ4xCZa@cluster0.cymdl8r.mongodb.net/user');
    await client.connect();
    const db = client.db('pragatipulse');
    const result = await db.collection('proposals').updateMany(
        {},
        { $set: { state: 'West Bengal' } }
    );
    console.log('Updated all proposals: ' + result.modifiedCount);
    await client.close();
}
fixProposals().catch(console.error);
