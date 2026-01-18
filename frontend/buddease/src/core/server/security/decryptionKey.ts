// decryptionKey.ts
import crypto from 'crypto';

// Function to generate a decryption key
export const generateDecryptionKey = (): string => {
  // Define the length of the decryption key (in bytes)
  const keyLength = 32; // 256 bits

  // Generate a random decryption key using a secure random bytes generator
  const decryptionKey = crypto.randomBytes(keyLength).toString('hex');

  return decryptionKey;
};
