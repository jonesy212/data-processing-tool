// FormDocumentMiddleware.tsx

import { DocumentOptions } from '@/core/documents/DocumentOptions';
import type { DocumentBuilderProps } from '@/core/documents/SharedDocumentProps';
import DocumentBuilder from '@/core/documents/SharedDocumentProps';
import DynamicForm from '@/core/pages/forms/DynamicForm';
import React, { useState } from 'react';

const FormDocumentMiddleware: React.FC = () => {
  const [documentBuilderProps, setDocumentBuilderProps] = useState<DocumentBuilderProps>({
    isDynamic: true,
    options: {
      // Initial document options
    },
    onOptionsChange: (newOptions: DocumentOptions) => {
      // Handle options change
    },
  });

  const [formData, setFormData] = useState<any>(null);

  // Function to handle form submission from DynamicForm
  const handleFormSubmit = (formData: any) => {
    setFormData(formData);
  };

  // Function to handle document generation
  const handleDocumentGeneration = () => {
    // Logic to generate document using formData and documentBuilderProps
    // You can pass formData and documentBuilderProps as needed to generate the document
  };

  return (
    <div id="formDocumentMiddleware">
      <DynamicForm onSubmit={handleFormSubmit} />
      <DocumentBuilder {...documentBuilderProps} />
      <button onClick={handleDocumentGeneration}>Generate Document</button>
    </div>
  );
};

export default FormDocumentMiddleware;
