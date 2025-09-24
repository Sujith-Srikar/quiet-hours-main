import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseClient';
import { getMongoClient } from '../../lib/mongodb';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('API /blocks - Request method:', req.method);
    
    // Expect bearer token from client: Authorization: Bearer <access_token>
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('API /blocks - Missing authorization header');
      return res.status(401).json({ error: 'Missing auth', message: 'Authorization header is required' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('API /blocks - Invalid authorization header format');
      return res.status(401).json({ error: 'Invalid auth format', message: 'Bearer token is required' });
    }

    // Create a server-side Supabase client for auth if supabaseAdmin is not available
    const authClient = supabaseAdmin || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    console.log('API /blocks - Validating token with Supabase');
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    
    if (userErr) {
      console.log('API /blocks - Token validation error:', userErr.message);
      return res.status(401).json({ error: 'Invalid token', message: userErr.message });
    }
    
    if (!userData.user) {
      console.log('API /blocks - No user data returned');
      return res.status(401).json({ error: 'Invalid token', message: 'User not found' });
    }
    
    const user = userData.user;
    console.log('API /blocks - User authenticated:', user.id, user.email);

  if (req.method === 'POST') {
    const { title, start_time, end_time } = req.body;
    if (!start_time) return res.status(400).json({ error: 'start_time required' });

    console.log('API /blocks - Creating new block for user:', user.id);
    
    const doc = {
      user_id: user.id,
      user_email: user.email,
      title: title ?? 'Silent block',
      start_time: new Date(start_time), // ensure proper ISO
      end_time: end_time ? new Date(end_time) : null,
      notified: false,
      created_at: new Date()
    };

    try {
      const client = await getMongoClient();
      const db = client.db();
      const blocks = db.collection('blocks');
      
      const insertResult = await blocks.insertOne(doc);
      console.log('API /blocks - Block created with ID:', insertResult.insertedId);
      
      try {
        // Use the same authClient we created earlier
        await authClient
          .from('schedule_triggers')
          .insert({
            mongo_id: insertResult.insertedId.toString(),
            user_id: user.id,
            scheduled_time: doc.start_time.toISOString()
          });
      } catch (e) {
        console.warn('Supabase trigger insert failed (non-fatal)', e);
      }

      // Always trigger the notification script for the new block, passing its ObjectId
      try {
        // Import modules at the top level instead
        const { spawn } = await import('child_process');
        const path = await import('path');
        const child = spawn('node', [
          path.join(process.cwd(), 'cron', 'sendNotifications.js'),
          insertResult.insertedId.toString()
        ], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
      } catch (err) {
        console.warn('Failed to trigger notification cron job:', err);
      }
      return res.status(201).json({ ok: true, id: insertResult.insertedId });
    } catch (mongoError: any) {
      console.error('API /blocks - MongoDB error during POST:', mongoError);
      return res.status(500).json({ 
        error: 'Database error', 
        message: 'Failed to create block' 
      });
    }
  }

  if (req.method === 'GET') {
    // Get blocks for the authenticated user
    const userId = req.query.user_id || user.id;
    console.log('API /blocks - Fetching blocks for user:', userId);
    
    try {
      const client = await getMongoClient();
      const db = client.db();
      const blocks = db.collection('blocks');
      
      const userBlocks = await blocks
        .find({ user_id: userId })
        .sort({ start_time: 1 })
        .toArray();
      
      console.log('API /blocks - Found blocks:', userBlocks.length);
      return res.status(200).json({ blocks: userBlocks });
    } catch (mongoError: any) {
      console.error('API /blocks - MongoDB error:', mongoError);
      return res.status(500).json({ 
        error: 'Database error', 
        message: 'Failed to fetch blocks from database' 
      });
    }
  }

  return res.status(405).end();
  } catch (error: any) {
    console.error('API /blocks - Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message || 'An unexpected error occurred' 
    });
  }
}
