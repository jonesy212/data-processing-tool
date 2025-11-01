// SanitizationFunctions.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { decryptedData } from '@/app/server/security/decryptedData';
import { Encryption } from '@/app/server/security/Encryption';
import { SnapshotDataType } from '@/app/snapshots/SnapshotContainer';
import { User } from '@/app/users/User';
import DOMPurify from 'dompurify';


interface SanitizeDataOptions {
  trimStrings?: boolean;
  removeEmptyArrays?: boolean;
  removeEmptyObjects?: boolean;
  deepSanitize?: boolean;
  stringSanitizer?: (input: string) => string;
  maxDepth?: number;
}


export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  // Password validation rules
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  // Add more validation rules for password complexity as needed

  return errors;
};

export const decryptData = (
  encryptedData: string,
  encryptionParams: Encryption
): string => {
  // Implement decryption logic using decryption algorithms
  return decryptedData(encryptedData, encryptionParams);
};

// Function to sanitize comments
export const sanitizeComments = (input: unknown): string => {
  // Handle null/undefined
  if (input == null) return '';

  let str: string;

  try {
    if (typeof input === 'string') str = input;
    else if (typeof input === 'number' || typeof input === 'boolean') str = String(input);
    else if (input instanceof Date) str = input.toISOString();
    else if (input instanceof Map || input instanceof Set) str = JSON.stringify(Array.from(input));
    else if (typeof input === 'object') str = JSON.stringify(input);
    else str = String(input);
  } catch (error) {
    console.warn("sanitizeComments: failed to convert input to string", input, error);
    str = '';
  }

  // Ensure we have a string before calling replace
  if (typeof str !== 'string') str = '';

  // Remove HTML tags
  const sanitized = str.replace(/<[^>]*>/g, '');

  // Escape special characters
  return sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};



// Helper function to escape special characters
const escapeSpecialCharacters = (comment: string): string => {
  // Implement logic to escape special characters
  // For example, replace characters like <, >, &, etc. with their HTML entities

  // Example: Replace < with &lt;, > with &gt;, & with &amp;, etc.
  const escapedComment = comment
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;");

  // Additional special character escapes can be added as needed

  return escapedComment;
};


export const sanitizeMessages = (message: unknown): string => {
  return sanitizeInput(message);
};

// Function to generate an authentication token for a user
export const generateAuthToken = (userId: string): string => {
  // Generate a random string of characters for the authentication token
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const tokenLength = 32; // Length of the authentication token
  let authToken = "";

  // Generate random characters for the token
  for (let i = 0; i < tokenLength; i++) {
    authToken += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  // Append the user ID to the token to make it unique
  authToken += `-${userId}`;

  return authToken;
};

// Function to validate an authentication token
export const validateAuthToken = (authToken: string): boolean => {
  const userId = extractUserIdFromToken(authToken);
  return isTokenValid(authToken, userId);
};


// Helper function to extract the user ID from the authentication token
const extractUserIdFromToken = (authToken: string): string => {
  const tokenParts = authToken.split("-");
  return tokenParts[tokenParts.length - 1];
};


// Helper function to perform token validation logic
const isTokenValid = (authToken: string, userId: string): boolean => {
  // Implement token validation logic here
  // For example, check if the token matches a certain format or if it's associated with the correct user ID

  // Example: Check if the token length is valid
  const isValidLength = authToken.length === 32 + userId.length + 1;

  // Example: Check if the token format is valid (e.g., alphanumeric characters)
  const isValidFormat = /^[a-zA-Z0-9]+$/.test(authToken.replace(`-${userId}`, ""));

  // Example: Check if the token is associated with the correct user ID
  const isValidUserId = authToken.endsWith(`-${userId}`);

  // Combine multiple validation conditions
  const isValid = isValidLength && isValidFormat && isValidUserId;

  return isValid;
};

// Function to validate user data
export const validateUserData = (userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string[] => {
  const errors: string[] = [];
  if (!userData.username) errors.push("Username is required.");
  else if (userData.username.length < 3) errors.push("Username must be at least 3 characters long.");
  else if (userData.username.length > 20) errors.push("Username cannot exceed 20 characters.");

  if (!userData.email) errors.push("Email is required.");
  else if (!isValidEmail(userData.email)) errors.push("Invalid email format.");

  return errors;
};


// Function to check if an email address is valid
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ✅ Replace manual sanitizeInput() with DOMPurify
export function sanitizeInput(input: unknown): string {
  let str = "";
  if (input == null) str = '';
  else if (typeof input === 'string') str = input;
  else if (typeof input === 'number' || typeof input === 'boolean') str = String(input);
  else if (input instanceof Date) str = input.toISOString();
  else if (input instanceof Map || input instanceof Set) str = JSON.stringify(Array.from(input));
  else if (typeof input === 'object') {
    try { str = JSON.stringify(input); } catch { str = ''; }
  } else str = String(input);

  let sanitized = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode >= 32 && charCode <= 126) sanitized += str[i];
  }
  return sanitized;
}

function sanitizeData<T extends object>(data: T, options?: SanitizeDataOptions, currentDepth: number = 0): Partial<T> {
  const { trimStrings = true, removeEmptyArrays = true, removeEmptyObjects = true, deepSanitize = true, stringSanitizer = (s: string) => s.trim(), maxDepth = 10 } = options || {};
  if (currentDepth > maxDepth) return {} as Partial<T>;

  const sanitized: Partial<T> = {};
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
    const value = data[key as keyof T];
    if (value === undefined || value === null) continue;

    if (typeof value === 'string') {
      try {
        const processed = trimStrings ? stringSanitizer(value) : value;
        if (processed !== '') (sanitized as any)[key] = processed;
      } catch {}
      continue;
    }

    if (Array.isArray(value)) {
      try {
        const cleanedArray = deepSanitize ? value.map(item => typeof item === 'object' && item !== null ? sanitizeData(item, options, currentDepth + 1) : item).filter(item => item != null) : value;
        if (!(removeEmptyArrays && cleanedArray.length === 0)) (sanitized as any)[key] = cleanedArray;
      } catch {}
      continue;
    }

    if (typeof value === 'object') {
      try {
        const cleanedObject = deepSanitize ? sanitizeData(value as object, options, currentDepth + 1) : value;
        const isEmptyObject = removeEmptyObjects && Object.keys(cleanedObject).length === 0;
        if (!isEmptyObject) (sanitized as any)[key] = cleanedObject;
      } catch {}
      continue;
    }

    (sanitized as any)[key] = value;
  }

  return sanitized;
}



/**
 * Universal sanitization function with smart defaults and robust type handling
 * 
 * @param input - Value to sanitize (any type)
 * @param options - {
 *   allowHtml: false,    // Set true to allow SOME HTML
 *   allowedTags: [],     // Only used if allowHtml=true
 *   strict: true,        // Extra security for untrusted input
 *   returnTrusted: false // Return TrustedHTML object
 *   maxDepth?: number    // Maximum recursion depth for object/array sanitization
 * }
 */
export function sanitize(input: unknown, options: { allowHtml?: boolean; allowedTags?: string[]; strict?: boolean; returnTrusted?: boolean; maxDepth?: number; } = {}, currentDepth: number = 0): string | TrustedHTML {
  const { allowHtml = false, allowedTags = [], strict = true, returnTrusted = false, maxDepth = 10 } = options;
  if (input == null) return '';

  if (currentDepth > maxDepth) return returnTrusted ? DOMPurify.sanitize('', { RETURN_TRUSTED_TYPE: true }) as unknown as TrustedHTML : '';

  let str: string;
  try {
    if (typeof input === 'string') str = input;
    else if (typeof input === 'number' || typeof input === 'boolean') str = String(input);
    else if (input instanceof Date) str = input.toISOString();
    else if (Array.isArray(input) || typeof input === 'object') str = JSON.stringify(sanitizeData(input, { trimStrings: true, deepSanitize: true, maxDepth: maxDepth - currentDepth }));
    else str = String(input);
  } catch { str = ''; }

  if (allowHtml) {
    try {
      const purified = DOMPurify.sanitize(str, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: strict ? [] : ['href', 'target', 'rel'],
        FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['style', 'on*'],
        RETURN_TRUSTED_TYPE: returnTrusted,
        ALLOW_DATA_ATTR: !strict,
      });
      return returnTrusted ? purified as unknown as TrustedHTML : purified;
    } catch { return ''; }
  }

  try {
    const purified = DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [], RETURN_TRUSTED_TYPE: returnTrusted });
    return returnTrusted ? purified as unknown as TrustedHTML : purified;
  } catch { return ''; }
}

// Unified sanitization logic for SnapshotData and Snapshot
function sanitizeSnapshotData<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T >(snapshotData?: SnapshotDataType<T>) {
  if (!snapshotData) return undefined;

  if (snapshotData instanceof Map) return snapshotData;

  if ('title' in snapshotData) {
    return {
      ...snapshotData,
      title: sanitize(snapshotData.title || ''),
      description: 'description' in snapshotData ? sanitize(snapshotData.description || '') : undefined
    };
  }

  return snapshotData;
}


// Function to filter and sanitize user data
export const sanitizeUIEvent = (event: React.UIEvent<HTMLDivElement>): React.UIEvent<HTMLDivElement> => {
  const scrollTop = (event.currentTarget as HTMLDivElement).scrollTop.toString();
  const scrollLeft = (event.currentTarget as HTMLDivElement).scrollLeft.toString();

  const sanitizedData = `Scroll Top: ${encodeData(scrollTop)}, Scroll Left: ${encodeData(scrollLeft)}`;
  return {
    ...event,
    currentTarget: {
      ...event.currentTarget,
      dataset: { ...event.currentTarget.dataset, sanitizedData }
    }
  };
};

// Function to encode user data to prevent XSS attacks
export const encodeData = (data: unknown): string => {
  if (data == null) return '';

  let str: string;
  if (typeof data === 'object' || Array.isArray(data)) {
    try { str = JSON.stringify(data); } catch { str = String(data); }
  } else str = String(data);

  const specialCharsRegex = /[&<>"'/]/g;
  const htmlEntities: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "/": "&#x2F;",
    "©": "&copy;", "®": "&reg;", "™": "&trade;", "€": "&euro;", "£": "&pound;", "¥": "&yen;",
    "¢": "&cent;", "§": "&sect;", "¶": "&para;", "−": "&minus;", "×": "&times;", "÷": "&divide;",
    "±": "&plusmn;", "≠": "&ne;", "≈": "&asymp;", "≤": "&le;", "≥": "&ge;", "∞": "&infin;",
    "α": "&alpha;", "β": "&beta;", "γ": "&gamma;", "Δ": "&Delta;", "π": "&pi;", "Ω": "&Omega;",
    "←": "&larr;", "→": "&rarr;", "↑": "&uarr;", "↓": "&darr;",
    "á": "&aacute;", "é": "&eacute;", "í": "&iacute;", "ñ": "&ntilde;", "ü": "&uuml;",
    " ": "&nbsp;", " ": "&thinsp;", "–": "&ndash;", "—": "&mdash;", "$": "&dollar;", "₹": "&#x20B9;",
    "₽": "&#x20BD;", "«": "&laquo;", "»": "&raquo;", "…": "&hellip;", "•": "&bull;", "¿": "&iquest;", "¡": "&iexcl;"
  };

  try { return str.replace(specialCharsRegex, (char) => htmlEntities[char] || char); }
  catch { return ''; }
};
  
export const isNullOrUndefined = (value: any): boolean => value === null || value === undefined;


export { sanitizeData, sanitizeSnapshotData };
