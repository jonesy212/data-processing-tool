// DIDManager.ts

import { generateDID, isValidDID } from './didUtils';

/**
 * DIDManager class provides functionalities related to managing Decentralized Identifiers (DIDs).
 */
class DIDManager {
    /**
     * Generate a unique Decentralized Identifier (DID) for a user.
     * @param userData User data used to generate the DID.
     * @returns The generated DID.
     */
    static generateUserDID(userData: any): string {
        return generateDID(userData);
    }

    /**
     * Check if a given string is a valid Decentralized Identifier (DID).
     * @param did The string to validate as a DID.
     * @returns True if the string is a valid DID, otherwise false.
     */
    static isValidDID(did: string): boolean {
        return isValidDID(did);
    }
}

export default DIDManager;
