ClientSanitization.ts

/**
 * Client-safe sanitization functions without server dependencies
 * Focused on XSS prevention and input validation
 */

===== CORE SANITIZATION FUNCTIONS =====

export const sanitizeComments = (input: unknown): string => {
  if (input == null || input === '') return '';
  
  let str: string;
  
  try {
    // Convert various input types to string safely
    if (typeof input === 'string') {
      str = input;
    } else if (typeof input === 'number' || typeof input === 'boolean') {
      str = String(input);
    } else if (input instanceof Date) {
      str = input.toISOString();
    } else if (Array.isArray(input)) {
      str = input.join(', ');
    } else if (input instanceof Map || input instanceof Set) {
      str = JSON.stringify(Array.from(input));
    } else if (typeof input === 'object') {
      try {
        str = JSON.stringify(input);
      } catch {
        str = '[Object]';
      }
    } else {
      str = String(input);
    }
  } catch (error) {
    console.warn('sanitizeComments: Conversion failed', error);
    return '';
  }

  // Remove any null bytes and control characters
  str = str.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Basic HTML tag removal and escaping
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

export const sanitizeInput = (input: unknown): string => {
  if (input == null) return '';
  
  const str = String(input);
  
  // Remove dangerous patterns
  return str
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/expression\(/gi, '') // Remove CSS expressions
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"']/g, '') // Remove remaining dangerous chars
    .substring(0, 10000); // Limit length to prevent DoS
};

export const sanitizeHTML = (html: string, allowedTags: string[] = []): string => {
  if (!html) return '';
  
  // Very basic HTML sanitization for client-side
  if (allowedTags.length === 0) {
    return html.replace(/<[^>]*>/g, ''); // Strip all HTML
  }
  
  // Allow specific tags (very basic implementation)
  const tagRegex = new RegExp(`</?(?!(${allowedTags.join('|')})\\b)[^>]+>`, 'gi');
  return html.replace(tagRegex, '');
};

===== VALIDATION FUNCTIONS =====

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const isValidUsername = (username: string): boolean => {
  // Alphanumeric, underscores, hyphens, 3-20 characters
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

export const isValidPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 128) errors.push('Password must be less than 128 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  if (!/[@$!%*?&]/.test(password)) errors.push('Password must contain a special character');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

===== STRING UTILITIES =====

export const truncateString = (str: string, maxLength: number, suffix: string = '...'): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const normalizeWhitespace = (str: string): string => {
  return str.replace(/\s+/g, ' ').trim();
};

===== URL SANITIZATION =====

export const sanitizeURL = (url: string): string => {
  if (!url) return '';
  
  try {
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      return ''; // Reject non-http(s) and non-relative URLs
    }
    
    // Remove dangerous protocols
    const cleanUrl = url
      .replace(/(javascript|vbscript|data):/gi, '')
      .replace(/[<>"']/g, '');
    
    return cleanUrl;
  } catch {
    return '';
  }
};

export const isValidURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

===== FILE NAME SANITIZATION =====

export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return 'file';
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .substring(0, 255); // Limit length
};

export const sanitizeFileExtension = (extension: string): string => {
  if (!extension) return '';
  
  return extension
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .substring(0, 10);
};

===== OBJECT/DATA SANITIZATION =====

export const sanitizeObject = <T extends Record<string, any>>(obj: T, depth: number = 3): Partial<T> => {
  if (depth <= 0) return {} as Partial<T>;
  if (typeof obj !== 'object' || obj === null) return obj as Partial<T>;
  
  const sanitized: Partial<T> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'string') {
      (sanitized as any)[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      (sanitized as any)[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (typeof value === 'object') {
      (sanitized as any)[key] = sanitizeObject(value, depth - 1);
    } else {
      (sanitized as any)[key] = value;
    }
  }
  
  return sanitized;
};

===== CONTENT SPECIFIC SANITIZATION =====

export const sanitizeSearchQuery = (query: string): string => {
  return sanitizeInput(query)
    .replace(/[%_]/g, '') // Remove SQL wildcards
    .substring(0, 100);
};

export const sanitizeJSON = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch {
    return '{}';
  }
};

export const sanitizeCSS = (css: string): string => {
  return css
    .replace(/javascript:/gi, '')
    .replace(/expression\(/gi, '')
    .replace(/url\([^)]*\)/gi, '') // Remove url() calls
    .replace(/[<>]/g, '');
};

===== SECURITY CHECKS =====

export const hasDangerousContent = (str: string): boolean => {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /expression\(/gi,
    /data:/gi,
    /<\?php/gi,
    /<\/?\w+[^>]*\sstyle\s*=/gi
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(str));
};

export const hasSQLInjection = (str: string): boolean => {
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(\bDROP\b.*\bTABLE\b)/gi,
    /(\bINSERT\b.*\bINTO\b)/gi,
    /(\bDELETE\b.*\bFROM\b)/gi,
    /(\bUPDATE\b.*\bSET\b)/gi,
    /('|\bOR\b.*=.*)/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(str));
};

===== PERFORMANCE OPTIMIZED VERSIONS =====

Fast version for high-frequency use
export const quickSanitize = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .substring(0, 500);
};

Batch sanitization for arrays
export const sanitizeArray = (inputs: unknown[]): string[] => {
  return inputs.map(input => sanitizeComments(input));
};

===== EXPORT ALL UTILITIES =====

export default {
  // Core sanitization
  sanitizeComments,
  sanitizeInput,
  sanitizeHTML,
  
  // Validation
  isValidEmail,
  isValidUsername,
  isValidPassword,
  isValidURL,
  
  // String utilities
  truncateString,
  escapeRegex,
  normalizeWhitespace,
  
  // URL and file handling
  sanitizeURL,
  sanitizeFileName,
  sanitizeFileExtension,
  
  // Object/data handling
  sanitizeObject,
  sanitizeSearchQuery,
  sanitizeJSON,
  sanitizeCSS,
  
  // Security checks
  hasDangerousContent,
  hasSQLInjection,
  
  // Performance versions
  quickSanitize,
  sanitizeArray
};