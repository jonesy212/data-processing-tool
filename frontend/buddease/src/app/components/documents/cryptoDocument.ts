// cryptoDocument.ts
export interface CryptoDocument {
    title: string;
    content: string;
    author: string;
    collaborators: Collaborator[];
    createdAt: Date;
    updatedAt: Date;
  }
  