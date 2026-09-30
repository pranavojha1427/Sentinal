const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('pragatipulse');
  const projs = await db.collection('projects').find({}).toArray();
  console.log('Total projects:', projs.length);
  const russia = projs.filter(p => [
    "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", 
    "Nizhny Novgorod", "Chelyabinsk", "Krasnoyarsk", "Samara", "Ufa"
  ].includes(p.state));
  console.log('Russia projects:', russia.length);
  process.exit(0);
}
run();
