const { createClient } = require('@supabase/supabase-js');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function cleanup() {
  console.log('Cleaning up Supabase projects...');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { error } = await supabase.from('projects').delete().in('id', [103965, 103964]);
  if (error) console.error('Supabase delete error:', error);
  else console.log('Deleted 2 Supabase projects.');

  console.log('Cleaning up MongoDB proposals and bids...');
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('pragatipulse');
  
  const propRes = await db.collection('proposals').deleteMany({
    _id: { $in: [new ObjectId('6aa6523cabaded90c5318ac9'), new ObjectId('6aa64ed83c6b26ce55fc9081')] }
  });
  console.log('Deleted proposals:', propRes.deletedCount);
  
  const bidRes = await db.collection('bids').deleteMany({
    proposalId: { $in: ['6aa6523cabaded90c5318ac9', '6aa64ed83c6b26ce55fc9081'] }
  });
  console.log('Deleted bids:', bidRes.deletedCount);

  await client.close();
  console.log('Cleanup complete!');
}
cleanup();
