// AdminLogin.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { serverAuthService } from '@/server/AuthService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          error: 'Missing credentials',
          code: 'MISSING_CREDENTIALS'
        });
      }

      const result = await serverAuthService.adminLogin(username, password);
      
      if (result.success) {
        // Additional admin-specific checks
        if (!result.user.roles?.includes('admin')) {
          return res.status(403).json({ 
            error: 'Insufficient privileges for admin access',
            code: 'INSUFFICIENT_PRIVILEGES'
          });
        }

        res.status(200).json({
          success: true,
          accessToken: result.accessToken,
          user: result.user,
          roles: result.roles || [],
          permissions: result.permissions || [],
          isAdmin: true
        });
      } else {
        res.status(401).json({ 
          error: result.error || 'Admin login failed',
          code: result.code || 'ADMIN_LOGIN_FAILED'
        });
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      if (error.code === 'ADMIN_ACCESS_REQUIRED') {
        res.status(403).json({ 
          error: 'Admin access required',
          code: 'ADMIN_ACCESS_REQUIRED'
        });
      } else if (error.code === 'INVALID_ADMIN_CREDENTIALS') {
        res.status(401).json({ 
          error: 'Invalid admin credentials',
          code: 'INVALID_ADMIN_CREDENTIALS'
        });
      } else {
        res.status(500).json({ 
          error: 'Internal server error',
          code: 'SERVER_ERROR'
        });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}