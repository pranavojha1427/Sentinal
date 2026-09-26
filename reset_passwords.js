const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function resetAllPasswords() {
    const client = new MongoClient('mongodb+srv://shreyancodes2006_db_user:NhT3AQBtQTZ4xCZa@cluster0.cymdl8r.mongodb.net/user');
    await client.connect();
    const db = client.db('pragatipulse');
    
    // Hash "password123"
    const newHash = await bcrypt.hash('password123', 10);
    
    const result = await db.collection('users').updateMany(
        {},
        { $set: { passwordHash: newHash, active: true } }
    );
    
    console.log(`Reset password for ${result.modifiedCount} users to password123`);
    await client.close();
}

resetAllPasswords().catch(console.error);
