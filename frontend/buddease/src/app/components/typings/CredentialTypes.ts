// CredentialTypes.ts

// Define TypeScript types related to verifiable credentials
interface VerifiableCredential {
    id: string;
    issuer: string;
    subject: string;
    issuedDate: Date;
    expirationDate?: Date;
    // Add more properties as needed
  }
  
  interface CredentialSchema {
    id: string;
    type: string[];
    properties: Record<string, any>;
    // Add more properties as needed
  }
  
  export type { CredentialSchema, VerifiableCredential };
  