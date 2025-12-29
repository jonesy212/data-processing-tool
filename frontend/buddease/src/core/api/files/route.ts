// route.ts
import isValidAuthToken from "@/core/server/security/AuthValidation";
import {
    implementSecurityMeasures,
    SecurityMeasureType
} from '@/core/server/security/SecurityMeasures'; // Adjust import path
import * as fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';

// Security headers for file operations
const fileSecurityMeasures = [
  {
    id: "file-x-content-type",
    type: SecurityMeasureType.Header,
    description: "Prevent MIME type sniffing for file responses",
    name: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    id: "file-x-frame-options",
    type: SecurityMeasureType.Header,
    description: "Prevent clickjacking attacks",
    name: "X-Frame-Options",
    value: "DENY"
  },
  {
    id: "file-csp",
    type: SecurityMeasureType.Header,
    description: "Content Security Policy for file operations",
    name: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'none';"
  }
];

// Security: Define allowed project roots
const ALLOWED_ROOTS = [
  process.cwd(),
  path.join(process.cwd(), 'src'),
  path.join(process.cwd(), 'app'),
  path.join(process.cwd(), 'public'),
];

/**
 * Validate if a path is safe and within allowed project boundaries
 */
function validatePath(requestedPath: string): { isValid: boolean; resolvedPath: string } {
  try {
    const resolvedPath = path.resolve(requestedPath);
    const isAllowed = ALLOWED_ROOTS.some(root => 
      resolvedPath.startsWith(root) && resolvedPath !== root
    );
    return { isValid: isAllowed, resolvedPath };
  } catch (error) {
    return { isValid: false, resolvedPath: requestedPath };
  }
}

/**
 * Create a secure response with security headers
 */
function createSecureResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Apply security measures to response headers
  implementSecurityMeasures(fileSecurityMeasures);
  
  // Additional security headers specific to file API
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const operation = searchParams.get('operation');
  const filePath = searchParams.get('path');
  const authToken = searchParams.get('authToken');

  // Validate authentication
  if (!authToken || !isValidAuthToken(authToken)) {
    return createSecureResponse(
      { error: 'Unauthorized' },
      401
    );
  }

  if (!filePath) {
    return createSecureResponse(
      { error: 'Path parameter is required' },
      400
    );
  }

  // Validate path security
  const { isValid, resolvedPath } = validatePath(filePath);
  if (!isValid) {
    return createSecureResponse(
      { error: 'Invalid path or access denied' },
      403
    );
  }

  try {
    switch (operation) {
      case 'readdir':
        const files = await fs.readdir(resolvedPath);
        return createSecureResponse({ files });

      case 'stat':
        const stat = await fs.stat(resolvedPath);
        return createSecureResponse({ 
          isDirectory: stat.isDirectory(),
          size: stat.size,
          modified: stat.mtime,
          name: path.basename(resolvedPath),
          path: resolvedPath
        });

      case 'readFile':
        const stats = await fs.stat(resolvedPath);
        if (stats.size > 10 * 1024 * 1024) {
          return createSecureResponse(
            { error: 'File too large' },
            413
          );
        }
        const content = await fs.readFile(resolvedPath, 'utf-8');
        return createSecureResponse({ content });

      case 'exists':
        try {
          await fs.access(resolvedPath);
          return createSecureResponse({ exists: true });
        } catch {
          return createSecureResponse({ exists: false });
        }

      default:
        return createSecureResponse(
          { error: 'Invalid operation. Use: readdir, stat, readFile, exists' },
          400
        );
    }
  } catch (error) {
    console.error('File operation error:', error);
    
    // Security logging could be added here using your SecurityMeasureLogger
    
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return createSecureResponse(
        { error: 'File or directory not found' },
        404
      );
    }
    
    if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      return createSecureResponse(
        { error: 'Permission denied' },
        403
      );
    }

    return createSecureResponse(
      { error: 'File operation failed' },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  const { authToken, operation, path: filePath, content } = await request.json();

  if (!authToken || !isValidAuthToken(authToken)) {
    return createSecureResponse(
      { error: 'Unauthorized' },
      401
    );
  }

  if (!filePath) {
    return createSecureResponse(
      { error: 'Path parameter is required' },
      400
    );
  }

  const { isValid, resolvedPath } = validatePath(filePath);
  if (!isValid) {
    return createSecureResponse(
      { error: 'Invalid path or access denied' },
      403
    );
  }

  try {
    switch (operation) {
      case 'writeFile':
        const dirname = path.dirname(resolvedPath);
        const dirStats = await fs.stat(dirname);
        if (!dirStats.isDirectory()) {
          return createSecureResponse(
            { error: 'Parent directory does not exist' },
            400
          );
        }
        await fs.writeFile(resolvedPath, content, 'utf-8');
        return createSecureResponse({ success: true, path: resolvedPath });

      case 'mkdir':
        await fs.mkdir(resolvedPath, { recursive: true });
        return createSecureResponse({ success: true, path: resolvedPath });

      default:
        return createSecureResponse(
          { error: 'Invalid operation' },
          400
        );
    }
  } catch (error) {
    console.error('File write error:', error);
    return createSecureResponse(
      { error: 'File write operation failed' },
      500
    );
  }
}

// Add OPTIONS method for CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  implementSecurityMeasures(fileSecurityMeasures);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}