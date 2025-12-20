// cryptoDocumentManager.ts
// frontend/app/security/CryptoDocumentManager.ts

import { DocumentTree } from "@/app/users/User";
import { CryptoDocument } from "@/app/documents/cryptoDocument";
import { encryptStringClient } from "@/app/security/clientEncrypt";

// Utility to check if we’re running in a browser
const isBrowser = typeof window !== "undefined";

export class CryptoDocumentManager {
  private documents: CryptoDocument[] = [];

  /**
   * Encrypts a document tree recursively.
   * Automatically decides between browser WebCrypto or server API call.
   */
  async encryptDocument(document: DocumentTree): Promise<DocumentTree> {
    const encryptedDocument: DocumentTree = {};

    for (const key in document) {
      if (!Object.prototype.hasOwnProperty.call(document, key)) continue;

      const value = document[key];

      if (typeof value === "string") {
        // Encrypt string values
        const encryptedValue = await this.encryptValue(value);
        encryptedDocument[key] = { encryptedValue };
      } else if (typeof value === "object" && value !== null) {
        // Recursively encrypt nested objects
        encryptedDocument[key] = await this.encryptDocument(value as DocumentTree);
      } else {
        // Leave primitives unchanged
        encryptedDocument[key] = value;
      }
    }

    return encryptedDocument;
  }

  /**
   * Encrypts a single string value using either WebCrypto (client) or server API (server).
   */
  private async encryptValue(value: string): Promise<string> {
    if (isBrowser) {
      // ✅ Use browser's Web Crypto API
      const key = process.env.NEXT_PUBLIC_CLIENT_ENCRYPTION_KEY || "client_key_placeholder";
      return await encryptStringClient(value, key);
    } else {
      // ✅ Use backend API endpoint to encrypt (server-side)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to encrypt value on server");
      }

      const { encrypted } = await response.json();
      return encrypted;
    }
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

  // Add a collaborator
  addCollaborator(document: CryptoDocument, collaborator: string): void {
    if (!document.collaborators.includes(collaborator)) {
      document.collaborators.push(collaborator);
      document.updatedAt = new Date();
    }
  }

  // Update document content
  updateContent(document: CryptoDocument, newContent: string): void {
    document.content = newContent;
    document.updatedAt = new Date();
  }

  // Get all crypto documents
  getAllDocuments(): CryptoDocument[] {
    return this.documents;
  }
}
