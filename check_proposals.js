const { MongoClient } = require('mongodb');
async function checkProposals() {
    const client = new MongoClient('mongodb+srv://shreyancodes2006_db_user:NhT3AQBtQTZ4xCZa@cluster0.cymdl8r.mongodb.net/user');
    await client.connect();
    const db = client.db('pragatipulse');
    const props = await db.collection('proposals').find({}).toArray();
    console.log(JSON.stringify(props, null, 2));
    await client.close();
}
checkProposals().catch(console.error);
