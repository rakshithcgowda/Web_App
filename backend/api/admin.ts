import type { VercelRequest, VercelResponse } from '@vercel/node';
import { database } from '../server/models/database-adapter.js';
import { authenticateTokenVercel } from '../server/middleware/auth.js';

// Import handlers from existing files
import adminOverviewHandler from './admin/stats-overview.js';
import adminGroupsHandler from './admin/stats-groups.js';
import adminDateRangeHandler from './admin/stats-date-range.js';
import adminUsersHandler from './admin/stats-users.js';
import adminTenderTypesHandler from './admin/stats-tender-types.js';
import adminFinancialHandler from './admin/stats-financial.js';
import adminBQCEntriesHandler from './admin/bqc-entries.js';
import adminUsersApprovalHandler from './admin/users.js';
import adminExportHandler from './admin/export.js';
import adminDbStatusHandler from './admin/db-status.js';

// Helper function to set CORS headers
function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the endpoint from URL
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const endpoint = url.pathname.split('/').pop();

  try {
    switch (endpoint) {
      case 'stats-overview':
        return await adminOverviewHandler(req, res);
      case 'stats-groups':
        return await adminGroupsHandler(req, res);
      case 'stats-date-range':
        return await adminDateRangeHandler(req, res);
      case 'stats-users':
        return await adminUsersHandler(req, res);
      case 'stats-tender-types':
        return await adminTenderTypesHandler(req, res);
      case 'stats-financial':
        return await adminFinancialHandler(req, res);
      case 'bqc-entries':
        return await adminBQCEntriesHandler(req, res);
      case 'users':
        return await adminUsersApprovalHandler(req, res);
      case 'export':
        return await adminExportHandler(req, res);
      case 'db-status':
        return await adminDbStatusHandler(req, res);
      default:
        return res.status(404).json({
          success: false,
          message: 'Endpoint not found'
        });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

