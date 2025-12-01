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

  try {
    // Verify admin token
    const authResult = await authenticateTokenVercel(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        message: authResult.message || 'Authorization token required'
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

    if (req.method === 'GET') {
      // Get all users (for admin dashboard)
      const users = await database.getAllUsers();
      
      res.json({
        success: true,
        data: users
      });
    } else if (req.method === 'POST') {
      // Approve user
      const { userId, action } = req.body;
      
      if (!userId || !action) {
        return res.status(400).json({
          success: false,
          message: 'User ID and action are required'
        });
      }

      if (action === 'approve') {
        await database.approveUser(userId, authResult.userId!);
        res.json({
          success: true,
          message: 'User approved successfully'
        });
      } else if (action === 'reject') {
        await database.rejectUser(userId);
        res.json({
          success: true,
          message: 'User rejected and removed'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use "approve" or "reject"'
        });
      }
    } else {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('User management error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
