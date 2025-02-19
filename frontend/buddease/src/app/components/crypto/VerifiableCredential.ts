// VerifiableCredential.ts
// VerifiableCredential.ts

import { signCredential, verifyCredential } from './credentialUtils';

/**
 * VerifiableCredential class provides functionalities related to managing verifiable credentials.
 */
class VerifiableCredential {
    /**
     * Sign a verifiable credential with the issuer's private key.
     * @param credentialData Data to be included in the verifiable credential.
     * @param privateKey Private key of the issuer.
     * @returns The signed verifiable credential.
     */
    static signCredential(credentialData: any, privateKey: string): string {
        return signCredential(credentialData, privateKey);
    }

    /**
     * Verify the authenticity of a verifiable credential using the issuer's public key.
     * @param credential The verifiable credential to be verified.
     * @param publicKey Public key of the issuer.
     * @returns True if the verifiable credential is authentic, otherwise false.
     */
    static verifyCredential(credential: string, publicKey: string): boolean {
        return verifyCredential(credential, publicKey);
    }
}

export default VerifiableCredential;
