// SanitizationFunctions.ts
import DOMPurify from "dompurify";
import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotDataType } from '@/app/components/snapshots';
import { User } from "../users/User";
import { decryptedData } from "./decryptedData";
import { Encryption } from "./Encryption";

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
export const sanitizeComments = (comment: string): string => {
  // Implement sanitization logic specific to comments

  // Remove HTML tags using regex
  const sanitizedComment = comment.replace(/<[^>]*>/g, "");

  // Escape special characters
  const escapedComment = escapeSpecialCharacters(sanitizedComment);

  return escapedComment;
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

export const sanitizeMessages = (message: string): string => {
  // Implement sanitization logic specific to messages
  // Example: Remove HTML tags, escape special characters
  const sanitizedMessage = sanitizeInput(message);
  return sanitizedMessage;
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
  // Extract the user ID from the authentication token
  const userId = extractUserIdFromToken(authToken);

  // Perform token validation logic
  const isValid = isTokenValid(authToken, userId);

  return isValid;
};

// Helper function to extract the user ID from the authentication token
const extractUserIdFromToken = (authToken: string): string => {
  // Split the token by the delimiter ('-')
  const tokenParts = authToken.split("-");

  // The last part of the token should be the user ID
  const userId = tokenParts[tokenParts.length - 1];

  return userId;
};

// Helper function to perform token validation logic
const isTokenValid = (authToken: string, userId: string): boolean => {
  // Implement token validation logic here
  // For example, check if the token matches a certain format or if it's associated with the correct user ID

  // Example: Check if the token length is valid
  const isValidLength = authToken.length === 32 + userId.length + 1;

  // Example: Check if the token format is valid (e.g., alphanumeric characters)
  const isValidFormat = /^[a-zA-Z0-9]+$/.test(authToken);

  // Example: Check if the token is associated with the correct user ID
  const isValidUserId = authToken.endsWith(`-${userId}`);

  // Combine multiple validation conditions
  const isValid = isValidLength && isValidFormat && isValidUserId;

  return isValid;
};

// Function to validate user data
export const validateUserData = (userData: User): string[] => {
  const errors: string[] = [];

  // Validate each field in the userData object
  if (!userData.username) {
    errors.push("Username is required.");
  } else if (userData.username.length < 3) {
    errors.push("Username must be at least 3 characters long.");
  } else if (userData.username.length > 20) {
    errors.push("Username cannot exceed 20 characters.");
  }

  if (!userData.email) {
    errors.push("Email is required.");
  } else if (!isValidEmail(userData.email)) {
    errors.push("Invalid email format.");
  }

  // Add more validation rules for other fields as needed

  return errors;
};

// Function to check if an email address is valid
const isValidEmail = (email: string): boolean => {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


// ✅ Replace manual sanitizeInput() with DOMPurify
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

/**
 * Universal sanitization function with smart defaults
 * 
 * @param input - Value to sanitize (any type)
 * @param options - {
 *   allowHtml: false,    // Set true to allow SOME HTML
 *   allowedTags: [],     // Only used if allowHtml=true
 *   strict: true         // Extra security for untrusted input
 * }
 */

export function sanitize(
  input: unknown,
  options: {
    allowHtml?: boolean;
    allowedTags?: string[];
    strict?: boolean;
    returnTrusted?: boolean;
  } = {}
): string | TrustedHTML {
  const { 
    allowHtml = false, 
    allowedTags = [], 
    strict = true,
    returnTrusted = false
  } = options;

  // Handle null/undefined
  if (input == null) return '';
  
  // Convert to string
  const str = typeof input === 'string' ? input : String(input);

  // HTML Mode
  if (allowHtml) {
    const purified = DOMPurify.sanitize(str, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: strict ? [] : ['href', 'target'],
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['style', 'on*'],
      RETURN_TRUSTED_TYPE: returnTrusted,
      ...(strict && { ALLOW_DATA_ATTR: false })
    });
    return returnTrusted ? purified as unknown as TrustedHTML : purified;
  }

  // Strict Text Mode (default)
  if (strict) {
    const purified = DOMPurify.sanitize(str, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      RETURN_TRUSTED_TYPE: returnTrusted,
    });
    return returnTrusted ? purified as unknown as TrustedHTML : purified;
  }

  // Lenient Text Mode
  const result = str
    .replace(/<[^>]*>?/gm, '')
    .replace(/[^\p{L}\p{N}\s.,!?@#$-]/gu, '');
    
  if (returnTrusted) {
    const purified = DOMPurify.sanitize(result, { RETURN_TRUSTED_TYPE: true });
    return purified as unknown as TrustedHTML;
  }
  return result;
}

// Unified sanitization logic for SnapshotData and Snapshot
function sanitizeSnapshotData<
  T extends BaseData<any>,
  K extends T = T
>(snapshotData?: SnapshotDataType<T>) {
  if (!snapshotData) return undefined;

  // Handle case where it's a Map
  if (snapshotData instanceof Map) {
    return snapshotData;
  }

  // Handle case where it has title/description
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
export const sanitizeUIEvent = (
  event: React.UIEvent<HTMLDivElement>
): React.UIEvent<HTMLDivElement> => {
  const scrollTop = (
    event.currentTarget as HTMLDivElement
  ).scrollTop.toString();
  const scrollLeft = (
    event.currentTarget as HTMLDivElement
  ).scrollLeft.toString();

  const sanitizedData = `Scroll Top: ${encodeData(
    scrollTop
  )}, Scroll Left: ${encodeData(scrollLeft)}`;

  return {
    ...event,
    currentTarget: {
      ...event.currentTarget,
      dataset: {
        ...event.currentTarget.dataset,
        sanitizedData,
      },
    },
  };
};


// Function to encode user data to prevent XSS attacks
export const encodeData = (data: string): string => {
  if (typeof data !== "string") {
    throw new Error("Input must be a string");
  }

  // Regular expression to match special characters
  const specialCharsRegex = /[&<>"'/]/g;

  // Map of special characters to their corresponding HTML entities
  const htmlEntities: Record<string, string> = {
    // Basic XML/HTML entities
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;", // or &apos; (but &apos; isn't supported in HTML4)
    "/": "&#x2F;",
    
    // Common special characters
    "©": "&copy;",
    "®": "&reg;",
    "™": "&trade;",
    "€": "&euro;",
    "£": "&pound;",
    "¥": "&yen;",
    "¢": "&cent;",
    "§": "&sect;",
    "¶": "&para;",
    
    // Mathematical symbols
    "−": "&minus;",
    "×": "&times;",
    "÷": "&divide;",
    "±": "&plusmn;",
    "≠": "&ne;",
    "≈": "&asymp;",
    "≤": "&le;",
    "≥": "&ge;",
    "∞": "&infin;",
    
    // Greek letters (common ones)
    "α": "&alpha;",
    "β": "&beta;",
    "γ": "&gamma;",
    "Δ": "&Delta;",
    "π": "&pi;",
    "Ω": "&Omega;",
    
    // Arrows
    "←": "&larr;",
    "→": "&rarr;",
    "↑": "&uarr;",
    "↓": "&darr;",
    
    // Accented characters
    "á": "&aacute;",
    "é": "&eacute;",
    "í": "&iacute;",
    "ñ": "&ntilde;",
    "ü": "&uuml;",
    
    // Whitespace and control characters
    " ": "&nbsp;", // Non-breaking space
    " ": "&thinsp;", // Thin space
    "–": "&ndash;", // En dash
    "—": "&mdash;", // Em dash
    
    // Currency symbols
    "$": "&dollar;",
    "₹": "&#x20B9;", // Indian Rupee
    "₽": "&#x20BD;", // Russian Ruble
    
    // Additional punctuation
    "«": "&laquo;",
    "»": "&raquo;",
    "…": "&hellip;",
    "•": "&bull;",
    "¿": "&iquest;",
    "¡": "&iexcl;"
  };

  // Function to replace special characters with HTML entities
  const replaceSpecialChars = (char: string): string => {
    return htmlEntities[char];
  };

  // Encode data by replacing special characters with HTML entities
  const encodedData = data.replace(specialCharsRegex, replaceSpecialChars);

  return encodedData;
};

export const isNullOrUndefined = (value: any): boolean => {
  return value === null || value === undefined;
};

export { sanitizeSnapshotData };
