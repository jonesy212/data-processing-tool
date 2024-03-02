// services/encryptionService.ts

import crypto from 'crypto';

/**
 * Service for managing encryption and decryption operations.
 */
class EncryptionService {
    /**
     * Encrypts the given data using the specified algorithm and key.
     * @param data The data to encrypt.
     * @param key The encryption key.
     * @param algorithm The encryption algorithm (e.g., 'aes-256-cbc').
     * @returns The encrypted data.
     */
    static encrypt(data: string, key: string, algorithm: string): string {
        const cipher = crypto.createCipher(algorithm, key);
        let encryptedData = cipher.update(data, 'utf8', 'hex');
        encryptedData += cipher.final('hex');
        return encryptedData;
    }

    /**
     * Decrypts the given encrypted data using the specified algorithm and key.
     * @param encryptedData The encrypted data to decrypt.
     * @param key The decryption key.
     * @param algorithm The decryption algorithm (e.g., 'aes-256-cbc').
     * @returns The decrypted data.
     */
    static decrypt(encryptedData: string, key: string, algorithm: string): string {
        const decipher = crypto.createDecipher(algorithm, key);
        let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
        decryptedData += decipher.final('utf8');
        return decryptedData;
    }
}

export default EncryptionService;
