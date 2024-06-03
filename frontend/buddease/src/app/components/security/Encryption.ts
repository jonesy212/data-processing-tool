// Encryption.ts

import { decryptedData } from "./decryptedData";
import { encryptData } from "./encryptedData";

// Define the Encryption interface for representing encryption data
interface Encryption {
  algorithm: string; // Algorithm used for encryption (e.g., AES-256-CBC)
  key: string; // Encryption key
  iv: string; // Initialization vector
}


// Function to perform encryption
const performEncryption = (data: string, encryptionParams: Encryption): string => {
  // Extract encryption key from encryptionParams
  const { key } = encryptionParams;

  // Encrypt the data using the provided key
  const encryptedData = encryptData(data, key);

  // Return the encrypted data
  return encryptedData;
};

// Function to perform decryption
const performDecryption = async (
  encryptedData: string,
  encryptionParams: Encryption
): Promise<string> => {
  // Decrypt the data using the provided decryption key
  const decryptData = decryptedData(
    encryptedData,
    encryptionParams
  );

  return decryptData;
};


export { performEncryption, performDecryption };
  
  
export type { Encryption };



