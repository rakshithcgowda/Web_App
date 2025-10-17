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

    const { format = 'csv', startDate = '', endDate = '' } = req.query;

    // Get export data
    const exportData = await database.getAdminExportData({
      format: format as string,
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Admin export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
}
