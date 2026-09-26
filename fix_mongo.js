const { MongoClient } = require('mongodb');
async function fix() {
    const client = new MongoClient('mongodb+srv://shreyancodes2006_db_user:NhT3AQBtQTZ4xCZa@cluster0.cymdl8r.mongodb.net/user');
    await client.connect();
    const db = client.db('pragatipulse');
    const proposals = db.collection('proposals');
    
    // Find proposals that have 'title' but not 'project_name'
    const docs = await proposals.find({ title: { $exists: true } }).toArray();
    for (const doc of docs) {
        await proposals.updateOne({ _id: doc._id }, {
            $set: {
                project_name: doc.title || "Untitled Project",
                expected_expenditure: doc.amount || "0",
                details: doc.description || "No description provided."
            },
            $unset: {
                title: '',
                amount: '',
                description: ''
            }
        });
        console.log('Fixed proposal', doc._id);
    }
    console.log('Done');
    await client.close();
}
fix().catch(console.error);
