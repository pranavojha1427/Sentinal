const { MongoClient } = require('mongodb');
async function check() {
    const client = new MongoClient('mongodb+srv://shreyancodes2006_db_user:NhT3AQBtQTZ4xCZa@cluster0.cymdl8r.mongodb.net/user');
    await client.connect();
    const db = client.db('pragatipulse');
    const user = await db.collection('users').findOne({ email: 'adminwb@pragatipulse.gov.in' });
    console.log(user);
    await client.close();
}
check().catch(console.error);
