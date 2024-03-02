// typings/DIDTypes.ts

// Define TypeScript types related to DIDs
interface DID {
    id: string;
    publicKey: string;
    authentication: string[];
    // Add more properties as needed
  }
  
  interface DIDDocument {
    id: string;
    publicKey: string;
    authentication: string[];
    // Add more properties as needed
  }
  
  export type { DID, DIDDocument };
  