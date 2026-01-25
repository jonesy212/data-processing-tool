// encryptedData.tsx
import crypto from 'crypto'; // Import the crypto module for encryption


export const encryptData = (data: string, encryptionKey: string): string => {
  // Define the encryption algorithm and cipher mode
  const algorithm = 'aes-256-cbc'; // Advanced Encryption Standard (AES) with a 256-bit key in Cipher Block Chaining (CBC) mode
  const iv = crypto.randomBytes(16); // Generate a random initialization vector (IV) of 16 bytes
  
  // Create a cipher object with the specified algorithm and key
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey), iv);
  
  // Encrypt the data
  let encryptedData = cipher.update(data, 'utf-8', 'hex'); // Input encoding: UTF-8, Output encoding: Hex
  
  // Append any remaining encrypted data and finalize the encryption
  encryptedData += cipher.final('hex');
  
  // Combine the IV and encrypted data for storage or transmission
  const combinedData = iv.toString('hex') + encryptedData;
  
  return combinedData;
};