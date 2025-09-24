const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config();

async function testDashboardAPI() {
  console.log('Testing Dashboard API call...');
  
  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Check if we have a session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check:', sessionError ? 'No session' : 'Session exists');
    
    if (!sessionData.session) {
      console.log('No active session found. Need to authenticate first.');
      return;
    }
    
    const accessToken = sessionData.session.access_token;
    const userId = sessionData.session.user.id;
    
    console.log('User ID:', userId);
    console.log('Access token exists:', !!accessToken);
    
    // Make the API call similar to dashboard
    const response = await fetch(`http://localhost:3000/api/blocks?user_id=${encodeURIComponent(userId)}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errData = await response.text();
      console.log('Error response:', errData);
      return;
    }
    
    const data = await response.json();
    console.log('Success! Blocks count:', data.blocks?.length || 0);
    console.log('Blocks:', data.blocks);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDashboardAPI().catch(console.error);