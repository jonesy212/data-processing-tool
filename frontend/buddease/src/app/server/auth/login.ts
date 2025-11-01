// login.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createPostgresAuthService } from '@/server/AuthServerService';

const authService = createPostgresAuthService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        // Map error codes to appropriate HTTP status codes
        const statusCode = getStatusCodeForError(result.code);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      console.error('Login API error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

function getStatusCodeForError(errorCode?: string): number {
  switch (errorCode) {
    case 'MISSING_CREDENTIALS':
      return 400;
    case 'USER_NOT_FOUND':
      return 404;
    case 'INVALID_CREDENTIALS':
    case 'LOGIN_FAILED':
      return 401;
    case 'ACCOUNT_LOCKED':
      return 423;
    default:
      return 500;
  }
}