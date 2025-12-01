import type { VercelRequest, VercelResponse } from '@vercel/node';
import { database } from '../server/models/database-adapter.js';
import { authenticateTokenVercel } from '../server/middleware/auth.js';

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
    // Authenticate token
    const authResult = await authenticateTokenVercel(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if user is admin (username: admin)
    const adminUser = await database.getUserById(authResult.userId!);
    if (!adminUser || adminUser.username !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Get user stats
    const stats = await database.getUserStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Admin stats users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load user stats'
    });
  }
}
