import type { VercelRequest, VercelResponse } from '@vercel/node';
import { database } from '../../server/models/database-adapter.js';
import { authenticateTokenVercel } from '../../server/middleware/auth.js';

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

    const id = parseInt(req.query.id as string);
    const userId = authResult.userId!;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid BQC ID'
      });
    }

    const bqcData = await database.getBQCDataById(id, userId);
    if (!bqcData) {
      return res.status(404).json({
        success: false,
        message: 'BQC data not found'
      });
    }

    res.json({
      success: true,
      data: bqcData
    });
  } catch (error) {
    console.error('Load BQC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load BQC data'
    });
  }
}
