import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import handlers from _handlers directory (not treated as API functions by Vercel)
import loginHandler from '../_handlers/auth/login.js';
import registerHandler from '../_handlers/auth/register.js';
import meHandler from '../_handlers/auth/me.js';
import logoutHandler from '../_handlers/auth/logout.js';

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
  const pathParts = url.pathname.split('/').filter(p => p);
  const endpoint = pathParts[pathParts.length - 1];

  try {
    switch (endpoint) {
      case 'login':
        return await loginHandler(req, res);
      case 'register':
        return await registerHandler(req, res);
      case 'me':
        return await meHandler(req, res);
      case 'logout':
        return await logoutHandler(req, res);
      default:
        return res.status(404).json({
          success: false,
          message: 'Endpoint not found'
        });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

