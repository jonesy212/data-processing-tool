'use client';

import { DocumentData } from '@/app/documents/editing/DocumentBuilder';
import { BaseData } from '@/app/models/data/Data';
import { DocumentOptions } from '@/app/documents/DocumentOptions';
import {DocumentTypeEnum } from '@/app/typings/documents'

export class ClientDocumentGenerator {
  async createTextDocument(
    type: DocumentTypeEnum,
    options: DocumentOptions,
    fileContent: ArrayBuffer
  ): Promise<string> {
    try {
      // Client-side document creation using browser APIs
      const content = options.content || "Default Text Document Content";
      
      // For client-side, we might create a Blob and download it
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return `Text Document created successfully and downloaded.`;
    } catch (error: any) {
      console.error("Error creating text document:", error);
      throw new Error("Error creating text document: " + error.message);
    }
  }

  async createFinancialReport(options: DocumentOptions, documents: DocumentData<BaseData<any>>): Promise<string> {
    try {
      // Call server API to generate financial report
      const response = await fetch('/api/documents/financial-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options, documents }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate financial report');
      }

      const result = await response.json();
      return result.message || 'Financial Report created successfully.';
    } catch (error) {
      console.error("Error creating financial report:", error);
      throw new Error("Error creating financial report.");
    }
  }

  // Client-only methods
  async downloadDocument(url: string, fileName: string): Promise<void> {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }
}


