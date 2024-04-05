// encryptString.ts
// Import any necessary cryptographic libraries or utilities
import crypto from 'crypto';

// Define a secret key for encryption (replace with your actual secret key)
const secretKey = 'your_secret_key_here';

// Function to encrypt a string using AES encryption algorithm
export function encryptString(text: string): string {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);

  // Create a cipher object using AES algorithm and secret key
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);

  // Encrypt the input text
  let encryptedText = cipher.update(text, 'utf-8', 'hex');
  encryptedText += cipher.final('hex');

  // Return the encrypted text with the initialization vector concatenated
  return iv.toString('hex') + encryptedText;
}