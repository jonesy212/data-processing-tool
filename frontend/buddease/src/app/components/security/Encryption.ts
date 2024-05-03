// Encryption.ts
// Define the Encryption interface for representing encryption data
interface Encryption {
  algorithm: string; // Algorithm used for encryption (e.g., AES-256-CBC)
  key: string; // Encryption key
  iv: string; // Initialization vector
}

export type { Encryption };
