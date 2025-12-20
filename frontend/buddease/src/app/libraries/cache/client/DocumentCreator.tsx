// DocumentCreator.tsx
'use client';

import { ClientDocumentGenerator } from '@/app/libraries/cache/client/DocumentGenerator'
import { DocumentTypeEnum } from '@/app/typings/documentTypes';

export default function DocumentCreator() {
  const handleCreateDocument = async () => {
    const generator = new ClientDocumentGenerator();
    try {
      const result = await generator.createTextDocument(
        DocumentTypeEnum.Text,
        { content: 'Hello World' },
        new ArrayBuffer(0)
      );
      alert(result);
    } catch (error) {
      alert('Error creating document');
    }
  };

  return (
    <button onClick={handleCreateDocument}>
      Create Document
    </button>
  );
}