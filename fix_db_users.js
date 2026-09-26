const { MongoClient } = require('mongodb');

async function fixUsers() {
    const client = new MongoClient('mongodb+srv://shreyancodes2006_db_user:NhT3AQBtQTZ4xCZa@cluster0.cymdl8r.mongodb.net/user');
    await client.connect();
    const db = client.db('pragatipulse');
    
    // Find users with 'password' field
    const users = await db.collection('users').find({ password: { $exists: true } }).toArray();
    
    for (const user of users) {
        await db.collection('users').updateOne(
            { _id: user._id },
            { 
                $set: { passwordHash: user.password, active: true },
                $unset: { password: "" }
            }
        );
        console.log(`Fixed user: ${user.email}`);
    }
    
    // Also make sure all state_admins are active
    await db.collection('users').updateMany(
        { role: 'state_admin', active: { $exists: false } },
        { $set: { active: true } }
    );
    
    await client.close();
}

fixUsers().catch(console.error);
