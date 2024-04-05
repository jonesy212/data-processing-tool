// decryptedData.ts
import * as crypto from 'crypto';
import { generateDecryptionKey } from './decryptionKey';


export const decryptedData = (encryptedData: string): string => {

    const decryptionKey = generateDecryptionKey();

    // Extract the IV from the combined data (first 32 characters)
    const ivHex = encryptedData.substring(0, 32);
    const iv = Buffer.from(ivHex, 'hex');
    
    // Extract the encrypted data (from the 33rd character onwards)
    const encryptedText = encryptedData.substr(32);
    
    // Define the decryption algorithm and cipher mode
    const algorithm = 'aes-256-cbc'; // Advanced Encryption Standard (AES) with a 256-bit key in Cipher Block Chaining (CBC) mode
    
    // Create a decipher object with the specified algorithm, key, and IV
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(decryptionKey), iv);
    
    // Decrypt the encrypted data
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf-8'); // Input encoding: Hex, Output encoding: UTF-8
    decryptedData += decipher.final('utf-8');
    
    return decryptedData;
  };