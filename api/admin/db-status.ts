import type { VercelRequest, VercelResponse } from '@vercel/node';
import { database } from '../../server/models/database-adapter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Get basic database stats
    const userStats = await database.getUserStats();
    const bqcStats = await database.getBQCStats();
    
    res.json({
      success: true,
      data: {
        users: userStats,
        bqc: bqcStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database status error:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
