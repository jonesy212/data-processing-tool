// cryptoDocumentManager.ts
import { encryptString } from "../security/encryptString";
import { DocumentTree } from "../users/User";
import { CryptoDocument } from "./cryptoDocument";



export class CryptoDocumentManager {
  private documents: CryptoDocument[] = [];

    

// Define the encryptDocument method
  async encryptDocument(document: DocumentTree): Promise<DocumentTree> {
    const encryptedDocument: DocumentTree = {};

    // Loop through each key-value pair in the document
    for (const key in document) {
      if (document.hasOwnProperty(key)) {
        const value = document[key];

        // Check if the value is a string or another document tree
        if (typeof value === "string") {
          // Encrypt the string value
          const encryptedValue = encryptString(value);
          // Wrap the encrypted string in an object
          encryptedDocument[key] = { encryptedValue };
        } else if (typeof value === "object" && value !== null) {
          // Recursively encrypt nested document trees
          encryptedDocument[key] = await this.encryptDocument(
            value as DocumentTree
          );
        } else {
          // Leave other types unchanged
          encryptedDocument[key] = value;
        }
      }
    }

    return encryptedDocument;
  }







  // Create a new crypto document
  createDocument(title: string, content: string, author: string): CryptoDocument {
    const document: CryptoDocument = {
      title,
      content,
      author,
      collaborators: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.push(document);
    return document;
  }

  // Add a collaborator to a crypto document
  addCollaborator(document: CryptoDocument, collaborator: string): void {
    if (!document.collaborators.includes(collaborator)) {
      document.collaborators.push(collaborator);
      document.updatedAt = new Date();
    }
  }

  // Update the content of a crypto document
  updateContent(document: CryptoDocument, newContent: string): void {
    document.content = newContent;
    document.updatedAt = new Date();
  }

  // Get all crypto documents
  getAllDocuments(): CryptoDocument[] {
    return this.documents;
  }
}
