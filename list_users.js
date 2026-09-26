const { MongoClient } = require('mongodb');
async function listUsers() {
    const client = new MongoClient('mongodb+srv://shreyancodes2006_db_user:NhT3AQBtQTZ4xCZa@cluster0.cymdl8r.mongodb.net/user');
    await client.connect();
    const db = client.db('pragatipulse');
    const users = await db.collection('users').find({}).toArray();
    users.forEach(u => {
        console.log(`- Email: ${u.email} | Name: ${u.name} | Role: ${u.role} | State: ${u.state || 'N/A'} | Ministry: ${u.ministry || 'N/A'} | Agency: ${u.agency || 'N/A'}`);
    });
    await client.close();
}
listUsers().catch(console.error);
