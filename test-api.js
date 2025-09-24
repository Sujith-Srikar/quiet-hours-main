const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testAPI() {
  console.log('Testing API endpoint...');
  
  // Check environment variables
  console.log('Environment check:');
  console.log('SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('SERVICE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('MONGODB_URI:', !!process.env.MONGODB_URI);
  
  // Test MongoDB connection
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB connection successful');
    
    const db = client.db();
    const blocks = db.collection('blocks');
    const count = await blocks.countDocuments();
    console.log('📊 Total blocks in database:', count);
    
    await client.close();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
  
  // Test Supabase connection
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.auth.getSession();
    console.log('📝 Supabase session check:', error ? 'No active session' : 'Session exists');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }
}

testAPI().catch(console.error);